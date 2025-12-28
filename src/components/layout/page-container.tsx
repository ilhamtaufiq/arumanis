import React from 'react';
import { Heading } from '../ui/heading';
import { Header } from './header';
import { Main } from './main';
import { cn } from '@/lib/utils';

function PageSkeleton() {
    return (
        <div className='flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <div className='bg-muted mb-2 h-8 w-48 rounded' />
                    <div className='bg-muted h-4 w-96 rounded' />
                </div>
            </div>
            <div className='bg-muted mt-6 h-40 w-full rounded-lg' />
            <div className='bg-muted h-40 w-full rounded-lg' />
        </div>
    );
}

export default function PageContainer({
    children,
    scrollable = true,
    isloading = false,
    access = true,
    accessFallback,
    pageTitle,
    pageDescription,
    pageHeaderAction
}: {
    children: React.ReactNode;
    scrollable?: boolean;
    isloading?: boolean;
    access?: boolean;
    accessFallback?: React.ReactNode;
    pageTitle?: string;
    pageDescription?: string;
    pageHeaderAction?: React.ReactNode;
}) {
    if (!access) {
        return (
            <div className='flex flex-1 items-center justify-center p-4 md:px-6'>
                {accessFallback ?? (
                    <div className='text-muted-foreground text-center text-lg'>
                        You do not have access to this page.
                    </div>
                )}
            </div>
        );
    }

    const content = isloading ? <PageSkeleton /> : children;

    return (
        <>
            <Header>
                {pageTitle && (
                    <div className='flex flex-col w-full'>
                        <div className='flex items-center justify-between'>
                            <Heading
                                title={pageTitle ?? ''}
                                description={pageDescription ?? ''}
                            />
                            {pageHeaderAction ? <div>{pageHeaderAction}</div> : null}
                        </div>
                    </div>
                )}
            </Header>

            <Main className={cn('flex-1', !scrollable && 'overflow-hidden')}>
                {content}
            </Main>
        </>
    );
}
