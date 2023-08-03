import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { NextResponse } from "next/server";
import * as z from 'zod';

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const {
            commentId,
            voteType
        } = CommentVoteValidator.parse(body);

        const session = await getAuthSession();

        if (!session?.user) {
            return new NextResponse('unauthorized', { status: 401 });
        }

        const existingVote = await db.commentVote.findFirst({
            where: {
                commentId,
                userId: session.user.id
            }
        });

        if (existingVote) {
            if (existingVote.type === voteType) {
                await db.commentVote.delete({
                    where: {
                        userId_commentId: {
                            userId: session.user.id,
                            commentId
                        }
                    }
                });

                return NextResponse.json('ok');
            } else {
                await db.commentVote.update({
                    where: {
                        userId_commentId: {
                            userId: session.user.id,
                            commentId
                        }
                    },
                    data: {
                        type: voteType
                    }
                });
                return NextResponse.json('ok');
            }
        }

        await db.commentVote.create({
            data: {
                type: voteType,
                commentId,
                userId: session.user.id
            }
        });
        return NextResponse.json('ok');
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse('invalid patch request data passed', { status: 422 });
        }

        return new NextResponse('could not vote for the post: internal error', { status: 500 });
    }
}