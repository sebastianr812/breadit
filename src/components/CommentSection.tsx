import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import PostComment from './PostComment';
import CreateComment from './CreateComment';


interface CommentSectionProps {
    postId: string;
}

const CommentSection = async ({
    postId
}: CommentSectionProps) => {

    const session = await getAuthSession();

    const comments = await db.comment.findMany({
        where: {
            postId,
            replyToId: null
        },
        include: {
            author: true,
            votes: true,
            replies: {
                include: {
                    author: true,
                    votes: true
                }
            }
        }
    });


    return (
        <div className='flex flex-col mt-4 gap-y-4'>
            <hr className='w-full h-px my-6' />


            <CreateComment
                postId={postId} />

            <div className='flex flex-col mt-4 gap-y-6'>
                {comments.filter((comment) => !comment.replyToId).map((topLevelComment) => {
                    const topLevelCommentVotesAmt = topLevelComment.votes.reduce((acc, curr) => {
                        if (curr.type === 'UP') {
                            return acc + 1;
                        }
                        if (curr.type === 'DOWN') {
                            return acc - 1;
                        }
                        return acc;
                    }, 0);

                    const topLevelCommentVote = topLevelComment.votes.find((vote) => vote.userId === session?.user?.id);

                    return (
                        <div key={topLevelComment.id} className='flex flex-col'>
                            <div className='mb-2'>
                                <PostComment
                                    currentVote={topLevelCommentVote}
                                    votesAmt={topLevelCommentVotesAmt}
                                    postId={postId}
                                    comment={topLevelComment} />
                            </div>
                            {/* Render replies */}

                            {topLevelComment.replies.sort((a, b) =>
                                b.votes.length - a.votes.length
                            ).map((reply) => {

                                const replyVotesAmt = reply.votes.reduce((acc, curr) => {
                                    if (curr.type === 'UP') {
                                        return acc + 1;
                                    }
                                    if (curr.type === 'DOWN') {
                                        return acc - 1;
                                    }
                                    return acc;
                                }, 0);

                                const replyVote = reply.votes.find((vote) => vote.userId === session?.user.id);

                                return (
                                    <div key={reply.id} className='py-2 pl-4 ml-2 border-l-2 border-zinc-200'>
                                        <PostComment
                                            comment={reply}
                                            currentVote={replyVote}
                                            postId={postId}
                                            votesAmt={replyVotesAmt} />
                                    </div>
                                )
                            })}

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CommentSection;