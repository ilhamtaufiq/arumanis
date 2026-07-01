import type { BuatLaporanStatus } from '../types'

type LaporanStatusInput = {
    progress_total?: number | null
    deviasi?: number | null
}

export const LAPORAN_STATUS_LABELS: Record<BuatLaporanStatus, string> = {
    belum_diisi: 'Belum diisi',
    tersimpan: 'Tersimpan',
    deviasi: 'Ada deviasi',
}

export const LAPORAN_STATUS_VARIANTS: Record<
    BuatLaporanStatus,
    'outline' | 'secondary' | 'default' | 'destructive'
> = {
    belum_diisi: 'outline',
    tersimpan: 'secondary',
    deviasi: 'destructive',
}

export function getLaporanStatus(item: LaporanStatusInput): BuatLaporanStatus {
    const progress = item.progress_total ?? 0
    if (progress === 0) return 'belum_diisi'

    const deviasi = Math.abs(item.deviasi ?? 0)
    if (deviasi >= 1) return 'deviasi'

    return 'tersimpan'
}