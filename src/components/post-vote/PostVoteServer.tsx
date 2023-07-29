import { Post, Vote, VoteType } from '@prisma/client';
import { FC } from 'react'

interface PostVoteServerProps {
    postId: string;
    initalVotesAmt?: number;
    initalVote?: VoteType | null;
    getData: () => Promise<(Post & { votes: Vote[] }) | null>
}

const PostVoteServer: FC<PostVoteServerProps> = ({ }) => {
    return <div>PostVoteServer</div>
}

export default PostVoteServer