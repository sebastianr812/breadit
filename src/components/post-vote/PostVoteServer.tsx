import { getAuthSession } from '@/lib/auth';
import type { Post, Vote, VoteType } from '@prisma/client';
import { notFound } from 'next/navigation';

import PostVoteClient from './PostVoteClient';

interface PostVoteServerProps {
    postId: string;
    initalVotesAmt?: number;
    initalVote?: VoteType | null;
    getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}



const PostVoteServer = async ({
    postId,
    initalVote,
    initalVotesAmt,
    getData
}: PostVoteServerProps) => {

    const session = await getAuthSession();

    let _votesAmt: number = 0;
    let _currentVote: VoteType | null | undefined = undefined;

    if (getData) {

        const post = await getData();
        if (!post) {
            return notFound();
        }

        _votesAmt = post.votes.reduce((acc, curr) => {
            if (curr.type === 'UP') {
                return acc + 1;
            }
            if (curr.type === 'DOWN') {
                return acc - 1;
            }

            return acc;
        }, 0);

        _currentVote = post.votes.find((vote) => vote.userId === session?.user.id)?.type;
    } else {
        _votesAmt = initalVotesAmt!
        _currentVote = initalVote
    }
    return (
        <PostVoteClient
            postId={postId}
            initalVoteAmt={_votesAmt}
            initalVote={_currentVote} />
    )
}

export default PostVoteServer