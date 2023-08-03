'use client';

import { FC, useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/Button';
import { useMutation } from '@tanstack/react-query';
import { CommentRequest } from '@/lib/validators/comment';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


interface CreateCommentProps {
    postId: string;
    replyToId?: string
}

const CreateComment: FC<CreateCommentProps> = ({
    postId,
    replyToId
}) => {

    const [input, setInput] = useState<string>('');
    const { loginToast } = useCustomToast();
    const router = useRouter();

    const {
        mutate: createComment,
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
            }

            const { data } = await axios.patch(`/api/subreddit/post/comment`, payload);
            return data;
        },
        onError: (e) => {
            if (e instanceof AxiosError) {
                if (e.response?.status === 401) {
                    return loginToast();
                }
            }
            return toast({
                title: 'There was a problem',
                description: 'Something went wrong, Please try again',
                variant: 'destructive'
            });
        },
        onSuccess: () => {
            router.refresh();
            setInput('');
        }
    })

    return (
        <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment'>
                Your Comment
            </Label>
            <div className='mt-2'>
                <Textarea
                    id='comment'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder='What are your thoughts?' />

                <div className='flex justify-end mt-2'>
                    <Button
                        disabled={input.length === 0}
                        isLoading={isLoading}
                        onClick={() => createComment({
                            postId,
                            replyToId,
                            text: input
                        })}>
                        Post
                    </Button>

                </div>
            </div>
        </div >
    )
}

export default CreateComment