import { describe, expect, it } from 'vitest'
import { getLaporanStatus } from '../lib/laporan-status'

describe('laporan status', () => {
    it('marks empty progress as belum diisi', () => {
        expect(getLaporanStatus({ progress_total: 0 })).toBe('belum_diisi')
    })

    it('marks saved progress without deviation as tersimpan', () => {
        expect(getLaporanStatus({ progress_total: 42.5, deviasi: 0.2 })).toBe('tersimpan')
    })

    it('marks meaningful deviation as deviasi', () => {
        expect(getLaporanStatus({ progress_total: 30, deviasi: -2.5 })).toBe('deviasi')
    })
})