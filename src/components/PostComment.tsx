'use client';

import { FC, useRef, useState } from 'react'
import UserAvatar from './UserAvatar';
import { ExtendedComment } from '@/types/db';
import { formatTimeToNow } from '@/lib/utils';
import CommentVotes from './CommentVotes';
import { CommentVote } from '@prisma/client';
import { Button } from './ui/Button';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { CommentRequest } from '@/lib/validators/comment';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';


interface PostCommentProps {
    comment: ExtendedComment;
    votesAmt: number;
    currentVote: CommentVote | undefined;
    postId: string
}

const PostComment: FC<PostCommentProps> = ({
    comment,
    votesAmt,
    currentVote,
    postId
}) => {
    const router = useRouter();
    const { data: session } = useSession();
    const commentRef = useRef<HTMLDivElement>(null);

    const [isReplying, setIsReplying] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');

    const {
        mutate: reply,
        isLoading
    } = useMutation({
        mutationFn: async ({
            postId,
            text,
            replyToId
        }: CommentRequest) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyToId
            };

            const { data } = await axios.patch('/api/subreddit/post/comment', payload);
            return data;
        },
        onError: () => {
            return toast({
                title: 'Something went wrong',
                description: 'Comment wasnt posted successfully',
                variant: 'destructive'
            });
        },
        onSuccess: () => {
            router.refresh();
            setIsReplying(false);
        }
    })

    return (
        <div className='flex flex-col' ref={commentRef}>
            <div className='flex items-center'>
                <UserAvatar user={{
                    name: comment.author.name || null,
                    image: comment.author.image || null
                }} className='w-6 h-6' />
                <div className='flex items-center ml-2 gap-x-2'>
                    <p className='text-sm font-medium text-gray-900'>
                        u/{comment.author.username}
                    </p>
                    <p className='text-xs truncate max-h-40 text-zinc-500'>
                        {formatTimeToNow(new Date(comment.createdAt))}
                    </p>
                </div>
            </div>
            <p className='mt-2 text-sm text-zinc-900'>
                {comment.text}
            </p>

            <div className='flex flex-wrap items-center gap-2'>
                <CommentVotes
                    commentId={comment.id}
                    initalVoteAmt={votesAmt}
                    initalVote={currentVote} />

                <Button
                    variant='ghost'
                    size='xs'
                    onClick={() => {
                        if (!session) {
                            return router.push('/sign-in')
                        }
                        setIsReplying(true);
                    }}
                >
                    <MessageSquare className='h-4 w-4 mr-1.5' />
                    Reply
                </Button>
                {isReplying ? (
                    <div className='grid w-full gap-1.5'>
                        <Label htmlFor='comment'>
                            Your comment
                        </Label>
                        <div className='mt-2'>
                            <Textarea
                                id='comment'
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={1}
                                placeholder='What are your thoughts?' />

                            <div className='flex justify-end gap-2 mt-2'>
                                <Button
                                    tabIndex={-1}
                                    variant='subtle'
                                    onClick={() => setIsReplying(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={input.length === 0}
                                    isLoading={isLoading}
                                    onClick={() => {
                                        if (!input) return;

                                        reply({
                                            postId,
                                            text: input,
                                            replyToId: comment.replyToId ?? comment.id
                                        })
                                    }}>
                                    Post
                                </Button>

                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default PostComment