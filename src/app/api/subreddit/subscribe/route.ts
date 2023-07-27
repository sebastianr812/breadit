import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
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
            subredditId
        } = SubredditSubscriptionValidator.parse(body);

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id
            }
        });

        if (subscriptionExists) {
            return new NextResponse('you are already subscribed', { status: 400 });
        }

        await db.subscription.create({
            data: {
                subredditId,
                userId: session.user.id
            }
        });

        return NextResponse.json(subredditId);
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse('invalid request data passed', { status: 422 });
        }
        return new NextResponse('could not subscribe', { status: 500 });
    }
}