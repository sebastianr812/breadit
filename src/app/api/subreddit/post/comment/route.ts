import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { NextResponse } from "next/server";
import * as z from 'zod';

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        const body = await req.json();
        const {
            postId,
            text,
            replyToId
        } = CommentValidator.parse(body);

        if (!session?.user) {
            return new NextResponse('unauthorized', { status: 401 });
        }

        await db.comment.create({
            data: {
                text,
                authorId: session.user.id,
                postId,
                replyToId
            }
        });

        return NextResponse.json('ok');
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse('invalid data passed for comment creation', { status: 422 });
        }
        return new NextResponse('could not create comment', { status: 500 });
    }
}