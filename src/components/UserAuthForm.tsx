'use client';

import { FC, useState } from 'react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react';
import { Icons } from './icons';
import { useToast } from '@/hooks/use-toast';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

const UserAuthForm: FC<UserAuthFormProps> = ({
    className,
    ...props
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loginWithGoogle = async () => {
        setIsLoading(true);

        try {

            await signIn('google');
        } catch (e) {
            toast({
                title: 'There was a problem',
                description: 'There was an error logging in with Google',
                variant: 'destructive'
            });
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={cn('flex justify-center', className)} {...props}>
            <Button
                size='sm'
                className='w-full'
                onClick={loginWithGoogle}
                isLoading={isLoading}
                disabled={isLoading}>
                {isLoading ? null : <Icons.google className='w-4 h-4 mr-2' />}
                Google
            </Button>
        </div>
    )
}

export default UserAuthForm