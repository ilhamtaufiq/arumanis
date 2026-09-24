import type { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'

type AccessPageShellProps = {
    title: string
    description: string
    actions?: ReactNode
    children: ReactNode
}

/**
 * Kerangka halaman Akses & Keamanan — menyamakan pola dashboard-v2:
 * banner + header fixed + Main fluid + heading + aksi + konten gap-6.
 */
export function AccessPageShell({ title, description, actions, children }: AccessPageShellProps) {
    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className='w-full max-w-none px-3 pb-8 pt-4 sm:px-5'>
                <div className='flex w-full min-w-0 flex-col gap-6'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                        <Heading title={title} description={description} />
                        {actions ? (
                            <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div>
                        ) : null}
                    </div>
                    {children}
                </div>
            </Main>
        </>
    )
}

type AccessSectionProps = {
    title: string
    description?: string
    children: ReactNode
}

/** Seksi konten ala V2Section dashboard: judul + deskripsi + isi. */
export function AccessSection({ title, description, children }: AccessSectionProps) {
    return (
        <section className='flex min-w-0 flex-col gap-3'>
            <div>
                <h2 className='text-base font-semibold tracking-tight'>{title}</h2>
                {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
            </div>
            {children}
        </section>
    )
}
