import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserNameValidator } from "@/lib/validators/username";
import { NextRequest, NextResponse } from "next/server";
import * as z from 'zod';

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();

        if (!session?.user) {
            return new NextResponse('unauthorized', { status: 401 });
        }

        const body = await req.json();

        const {
            username
        } = UserNameValidator.parse(body);

        const _username = await db.user.findFirst({
            where: {
                username
            }
        });

        if (_username) {
            return new NextResponse('username is taken', { status: 409 });
        }

        await db.user.update({
            where: {
                id: session.user.id
            },
            data: {
                username
            }
        });
        return NextResponse.json('ok');

    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse('ivalid patch request data ')
        }
        return new NextResponse('internale error, could not update username', { status: 500 });
    }
}