import { formatTimeToNow } from '@/lib/utils';
import { ExtendedPost } from '@/types/db';
import { Post, User, Vote } from '@prisma/client';
import { FC } from 'react'

interface PostProps {
    subredditName: string;
    post: Post & {
        author: User;
        votes: Vote[];
    }
}

const Post: FC<PostProps> = ({
    subredditName,
    post
}) => {
    return (
        <div className='bg-white rounded-md shadow'>
            <div className='flex justify-between px-6 py-4'>
                {/* TODO: Post votes */}

                <div className='flex-1 w-0'>
                    <div className='mt-1 text-xs text-gray-500 max-h-40'>
                        {subredditName ? (
                            <>
                                <a className='text-sm underline text-zinc-900 underline-offset-2'
                                    href={`/r/${subredditName}`}>
                                    r/{subredditName}
                                </a>
                                <span className='px-1'>
                                    •
                                </span>
                            </>
                        ) : null}
                        <span>
                            Posted by u/{post.author.name}
                        </span>
                        {' '}
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>
                    <a>
                        {`/r/${subredditName}`}
                    </a>
                </div>
            </div>

        </div>
    )
}

export default Post