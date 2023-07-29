import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { CachedPost } from "@/types/redis";
import { Post, User, Vote } from "@prisma/client";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        slug: string;
        postId: string;
    }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const page = async ({
    params: {
        slug,
        postId
    }
}: PageProps) => {

    const cachedPost = (await redis.hgetall(`post:${postId}`)) as CachedPost;

    let post: (Post & {
        votes: Vote[],
        author: User
    }) | null = null

    if (!cachedPost) {
        post = await db.post.findFirst({
            where: {
                id: postId
            },
            include: {
                votes: true,
                author: true
            }
        });
    }

    if (!post && !cachedPost) {
        return notFound();
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-between h-full sm:flex-row sm:items-start">

            </div>
        </div>
    )
}

export default page