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
        <div className='flex flex-wrap items-center justify-between gap-3 border-[2px] border-[#111111] bg-[#F0F9FF] px-4 py-3 shadow-[3px_3px_0_0_#111111]'>
            <div className='text-sm font-semibold leading-relaxed text-[#111111]/85'>
                {isLoading && 'Memuat data capaian terbaru dari server…'}
                {!isLoading && isLive && timestamp && (
                    <>
                        <span className='font-black text-[#111111]'>Data live</span> — diperbarui{' '}
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
                    className='inline-flex items-center gap-1.5 border-[2px] border-[#111111] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111] transition-all hover:bg-[#8ECAE6] disabled:opacity-60'
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden />
                    Muat ulang
                </button>
            )}
        </div>
    )
}