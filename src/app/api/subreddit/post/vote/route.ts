import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { NextResponse } from "next/server";
import * as z from 'zod';

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const {
            postId,
            voteType
        } = PostVoteValidator.parse(body);

        const session = await getAuthSession();

        if (!session?.user) {
            return new NextResponse('unauthorized', { status: 401 });
        }

        const existingVote = await db.vote.findFirst({
            where: {
                postId,
                userId: session.user.id
            }
        });

        const post = await db.post.findUnique({
            where: {
                id: postId
            },
            include: {
                author: true,
                votes: true
            }
        });

        if (!post) {
            return new NextResponse('post not found', { status: 404 });
        }

        if (existingVote) {
            if (existingVote.type === voteType) {
                await db.vote.delete({
                    where: {
                        userId_postId: {
                            userId: session.user.id,
                            postId
                        }
                    }
                });
                return NextResponse.json('ok');
            }

            await db.vote.update({
                where: {
                    userId_postId: {
                        postId,
                        userId: session.user.id
                    }
                },
                data: {
                    type: voteType
                }
            });
            // recount the votes

            const votesAmt = post.votes.reduce((acc, curr) => {
                if (curr.type === 'UP') {
                    return acc + 1;
                }
                if (curr.type === 'DOWN') {
                    return acc - 1;
                }
                return acc
            }, 0);

            if (votesAmt >= CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedPost = {
                    authorUsername: post.author.username ?? '',
                    content: JSON.stringify(post.content),
                    id: post.id,
                    title: post.title,
                    currentVote: voteType,
                    createdAt: post.createdAt
                }
                await redis.hset(`post:${postId}`, cachePayload);
            }
            return NextResponse.json('ok');
        }

        await db.vote.create({
            data: {
                type: voteType,
                postId,
                userId: session.user.id
            }
        });

        const votesAmt = post.votes.reduce((acc, curr) => {
            if (curr.type === 'UP') {
                return acc + 1;
            }
            if (curr.type === 'DOWN') {
                return acc - 1;
            }
            return acc
        }, 0);

        if (votesAmt >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedPost = {
                authorUsername: post.author.username ?? '',
                content: JSON.stringify(post.content),
                id: post.id,
                title: post.title,
                currentVote: voteType,
                createdAt: post.createdAt
            }
            await redis.hset(`post:${postId}`, cachePayload);
        }
        return NextResponse.json('ok');
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse('invalid patch request data passed', { status: 422 });
        }

        return new NextResponse('could not vote for the post: internal error', { status: 500 });
    }
}