import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { NextResponse } from "next/server";
import * as z from 'zod';


export async function POST(req: Request) {
    try {
        const session = await getAuthSession();

        if (!session?.user) {
            return new NextResponse('unauthorized', { status: 401 });
        }

        const body = await req.json();
        const {
            subredditId,
            title,
            content
        } = PostValidator.parse(body);

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id
            }
        });

        if (!subscriptionExists) {
            return new NextResponse('you must be subscribed to post', { status: 400 });
        }

        await db.post.create({
            data: {
                subredditId,
                title,
                content,
                authorId: session.user.id
            }
        });

        return new NextResponse('ok');
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse('invalid request data passed', { status: 422 });
        }
        return new NextResponse('could not post to subreddit at this time', { status: 500 });
    }
}