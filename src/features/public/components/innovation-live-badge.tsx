import { RefreshCw } from 'lucide-react'
import { formatGeneratedAtLabel } from '../lib/innovation-stats'

type InnovationLiveBadgeProps = {
    isLoading: boolean
    isLive: boolean
    generatedAt: Date | null
    onRefresh?: () => void
}

export function InnovationLiveBadge({
    isLoading,
    isLive,
    generatedAt,
    onRefresh,
}: InnovationLiveBadgeProps) {
    const timestamp = formatGeneratedAtLabel(generatedAt)

    return (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3'>
            <div className='text-sm leading-relaxed text-foreground/85'>
                {isLoading && 'Memuat data capaian terbaru dari server…'}
                {!isLoading && isLive && timestamp && (
                    <>
                        <span className='font-bold text-foreground'>Data live</span> — diperbarui{' '}
                        {timestamp} dari basis data operasional Arumanis.
                    </>
                )}
                {!isLoading && !isLive && (
                    <>
                        Data capaian sementara tidak tersedia. Tampilan angka menggunakan teks
                        statis hingga koneksi API pulih.
                    </>
                )}
            </div>
            {onRefresh && (
                <button
                    type='button'
                    onClick={onRefresh}
                    disabled={isLoading}
                    className='inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-60'
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden />
                    Muat ulang
                </button>
            )}
        </div>
    )
}