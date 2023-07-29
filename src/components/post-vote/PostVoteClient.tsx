'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import { VoteType } from '@prisma/client';
import { FC, useEffect, useState } from 'react'
import { Button } from '../ui/Button';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { PostVoteRequest } from '@/lib/validators/vote';
import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

interface PostVoteClientProps {
    postId: string;
    initalVoteAmt: number;
    initalVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
    postId,
    initalVoteAmt,
    initalVote
}) => {

    const { loginToast } = useCustomToast();
    const [votesAmt, setVotesAmt] = useState<number>(initalVoteAmt);
    const [currentVote, setCurrentVote] = useState(initalVote);

    const prevVote = usePrevious(currentVote);

    useEffect(() => {
        setCurrentVote(initalVote);
    }, [initalVote]);

    const {
        mutate: vote
    } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: PostVoteRequest = {
                postId,
                voteType
            }

            await axios.patch('/api/subreddit/post/vote', payload);
        },
        onError: (e, voteType) => {
            if (voteType === 'UP') {
                setVotesAmt((prev) => prev - 1);
            } else {
                setVotesAmt((prev) => prev + 1);
            }

            // reset current vote
            setCurrentVote(prevVote);
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: 'Something went wrong',
                description: 'Your vote was not registered',
                variant: 'destructive'
            });
        },
        onMutate: (type: VoteType) => {
            if (currentVote === type) {
                setCurrentVote(undefined);
                if (type === 'UP') {
                    setVotesAmt((prev) => prev - 1);
                }
                if (type === 'DOWN') {
                    setVotesAmt((prev) => prev + 1);
                }
            } else {
                setCurrentVote(type);
                if (type === 'UP') {
                    setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
                } else if (type === 'DOWN') {
                    setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
                }
            }
        }
    })



    return (
        <div className='flex gap-4 pb-4 pr-6 sm:flex-col sm:gap-0 sm:w-20 sm:pb-0'>
            <Button
                size='sm'
                variant='ghost'
                aria-label='upvote'
                onClick={() => vote('UP')}>
                <ArrowBigUp className={cn('h-5 w-5 text-zinc-700',
                    currentVote === 'UP' && 'text-emerald-500 fill-emerald-500'
                )} />
            </Button>

            <p className='py-2 text-sm font-medium text-center text-zinc-900'>
                {votesAmt}
            </p>

            <Button
                size='sm'
                variant='ghost'
                aria-label='upvote'
                onClick={() => vote('DOWN')}>
                <ArrowBigDown className={cn('h-5 w-5 text-zinc-700',
                    currentVote === 'DOWN' && 'text-red-500 fill-red-500'
                )} />
            </Button>
        </div>

    )
}

export default PostVoteClient