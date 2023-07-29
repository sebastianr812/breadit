import { INFINITES_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { db } from "@/lib/db"
import PostFeed from "./PostFeed";

const GeneralFeed = async () => {
    const posts = await db.post.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true
        },
        take: INFINITES_SCROLLING_PAGINATION_RESULTS,
    });

    return <PostFeed
        initalPosts={posts} />
}
export default GeneralFeed;