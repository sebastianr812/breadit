import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        slug: string;
    }
}
const page = async ({
    params: {
        slug
    }
}: PageProps) => {
    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug
        }
    });

    if (!subreddit) {
        return notFound();
    }

    return (
        <div className="flex flex-col items-start gap-6">
            <div className="pb-5 border-b border-gray-200">

            </div>
        </div>
    )
}

export default page