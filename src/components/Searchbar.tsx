'use client';

import { useCallback, useEffect, useRef, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Prisma, Subreddit } from '@prisma/client';
import { usePathname, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import debounce from 'lodash.debounce';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

const Searchbar = () => {

    const router = useRouter();
    const pathname = usePathname();
    const [input, setInput] = useState<string>('');
    const commandRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(commandRef, () => {
        setInput('');
    });

    useEffect(() => {
        setInput('');
    }, [pathname]);

    const {
        data: queryData,
        refetch,
        isFetched,
    } = useQuery({
        queryFn: async () => {
            if (!input) return [];
            const { data } = await axios.get(`/api/search?q=${input}`);
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[];
        },
        queryKey: ['search-query'],
        enabled: false
    });

    const request = debounce(() => {
        refetch();
    }, 300);

    const debounceRequest = useCallback(() => {
        request();
    }, [request]);

    return (
        <Command className='relative z-50 max-w-lg overflow-visible border rounded-lg' ref={commandRef}>
            <CommandInput
                className='border-none outline-none focus:border-none focus:outline-none ring-0'
                placeholder='Search communities...'
                value={input}
                onValueChange={(text) => {
                    setInput(text);
                    debounceRequest();
                }}
            />
            {input.length > 0 ? (
                <CommandList className='absolute inset-x-0 bg-white shadow top-full rounded-b-md'>
                    {isFetched && <CommandEmpty>No results found</CommandEmpty>}
                    {(queryData?.length ?? 0) > 0 ? (
                        <CommandGroup heading='Communities'>
                            {queryData?.map((subreddit) => (
                                <CommandItem
                                    key={subreddit.id}
                                    value={subreddit.name}
                                    onSelect={(e) => {
                                        router.push(`/r/${e}`);
                                        router.refresh();
                                    }}>
                                    <Users className='w-4 h-4' />
                                    <a
                                        href={`/r/${subreddit.name}`}
                                    >
                                        r/{subreddit.name}
                                    </a>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            ) : null}
        </Command>
    )
}

export default Searchbar