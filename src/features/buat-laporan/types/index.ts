import type { Pekerjaan } from '@/features/pekerjaan/types'

export type BuatLaporanStatus = 'belum_diisi' | 'tersimpan' | 'deviasi'

export type BuatLaporanListItem = Pekerjaan

export type BuatLaporanEditorSnapshot = {
    weightedProgress: number
    hasChanges: boolean
}