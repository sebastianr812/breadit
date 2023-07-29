'use client';

import { ExtendedPost } from '@/types/db'
import { FC, useEffect, useRef } from 'react'
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { INFINITES_SCROLLING_PAGINATION_RESULTS } from '@/config';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Post from './Post';

interface PostFeedProps {
    initalPosts: ExtendedPost[]
    subredditName?: string
}

const PostFeed: FC<PostFeedProps> = ({
    initalPosts,
    subredditName
}) => {
    const lastPostRef = useRef<HTMLElement>(null);
    const {
        ref,
        entry
    } = useIntersection({
        root: lastPostRef.current,
        threshold: 1
    });

    const { data: session } = useSession();

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        ['infinite-query'],
        async ({ pageParam = 1 }) => {
            const query =
                `/api/posts?limit=${INFINITES_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
                (!!subredditName ? `&subredditName=${subredditName}` : '')

            const { data } = await axios.get(query);
            return data as ExtendedPost[];
        }, {
        getNextPageParam: (_, pages) => {
            return pages.length + 1
        },
        initialData: {
            pages: [initalPosts],
            pageParams: [1]
        }
    }
    );

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage]);

    const posts = data?.pages.flatMap((page) => page) ?? initalPosts;

    return (
        <ul className='flex flex-col col-span-2 space-y-6'>
            {posts.map((post, index) => {
                const votesAmount = post.votes.reduce((acc, curr) => {
                    if (curr.type === 'UP') {
                        return acc + 1;
                    }
                    if (curr.type === 'DOWN') {
                        return acc - 1
                    }
                    return acc
                }, 0);

                const currentVote = post.votes.find((vote) => vote.userId === session?.user.id);

                if (index === posts.length - 1) {
                    return (
                        <li key={post.id} ref={ref}>
                            <Post
                                votesAmt={votesAmount}
                                currentVote={currentVote}
                                commentAmt={post.comments.length}
                                post={post}
                                subredditName={post.subreddit.name} />
                        </li>
                    )
                } else {
                    return <Post
                        votesAmt={votesAmount}
                        currentVote={currentVote}
                        commentAmt={post.comments.length}
                        post={post}
                        subredditName={post.subreddit.name} />
                }
            })}
        </ul>
    )
}

export default PostFeed