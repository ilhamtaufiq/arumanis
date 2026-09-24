import { RefreshCw } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { useV2Stats } from '../hooks/use-v2-stats'

export function V2Section({
    title,
    description,
    children,
}: {
    title: string
    description?: string
    children: React.ReactNode
}) {
    return (
        <section className='flex flex-col gap-3'>
            <div>
                <h2 className='text-base font-semibold tracking-tight'>{title}</h2>
                {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
            </div>
            {children}
        </section>
    )
}

function V2StatsFallback() {
    return (
        <div className='rounded-2xl border border-dashed bg-card p-8 text-center'>
            <p className='text-sm font-medium'>Ringkasan organisasi tersedia untuk admin & manager.</p>
            <p className='mt-1 text-sm text-muted-foreground'>
                Gunakan Dashboard utama untuk antrian kerja dan kalender harian Anda.
            </p>
        </div>
    )
}

type V2PageShellProps = {
    children: React.ReactNode
}

/** Kerangka halaman ringkasan v2: banner + header + gate admin/manager (tanpa hero judul). */
export function V2PageShell({ children }: V2PageShellProps) {
    const { canViewStats, isFetching, refetch, error } = useV2Stats()

    return (
        <>
            <BannerNotification />
            <Header fixed />

            <Main fluid className='w-full max-w-none px-3 pb-8 pt-4 sm:px-5'>
                <div className='flex w-full min-w-0 flex-col gap-4'>
                    {canViewStats ? (
                        error ? (
                            <V2StatsError
                                message={error instanceof Error ? error.message : 'Gagal memuat data.'}
                                onRetry={() => void refetch()}
                                isRetrying={isFetching}
                            />
                        ) : (
                            children
                        )
                    ) : (
                        <V2StatsFallback />
                    )}
                </div>
            </Main>
        </>
    )
}

function V2StatsError({
    message,
    onRetry,
    isRetrying,
}: {
    message: string
    onRetry: () => void
    isRetrying: boolean
}) {
    return (
        <div className='rounded-2xl border border-destructive/50 bg-card p-8 text-center'>
            <p className='text-sm font-medium'>Gagal memuat data dashboard.</p>
            <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
            <Button variant='outline' size='sm' className='mt-4' onClick={onRetry} disabled={isRetrying}>
                <RefreshCw className={isRetrying ? 'animate-spin' : ''} />
                Coba lagi
            </Button>
        </div>
    )
}
