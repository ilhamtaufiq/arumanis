import { describe, expect, it } from 'vitest'
import {
    findManualAchievement,
    isIntegrasiAchievement,
    sumAchievementsForTahun,
} from '../lib/achievement-source'
import type { SpamAchievement } from '../types'

const base = { unit_spam_id: 1, jumlah_bjp_kk: 0, jumlah_bjp_jiwa: 0 }
const list: SpamAchievement[] = [
    { ...base, id: 1, tahun: '2026', sumber: 'manual', jumlah_sr: 10, jumlah_kk: 10, jumlah_jiwa: 50 },
    { ...base, id: 2, tahun: '2026', sumber: 'integrasi', jumlah_sr: 30, jumlah_kk: 30, jumlah_jiwa: 150 },
    // Rekam integrasi lama sebelum kolom sumber ada
    { ...base, id: 3, tahun: '2027', jumlah_sr: 5, jumlah_kk: 5, jumlah_jiwa: 25, catatan: 'Akumulasi dari paket pekerjaan tertaut' },
]

describe('achievement-source', () => {
    it('detects integration records (new and legacy)', () => {
        expect(isIntegrasiAchievement(list[0])).toBe(false)
        expect(isIntegrasiAchievement(list[1])).toBe(true)
        expect(isIntegrasiAchievement(list[2])).toBe(true)
    })

    it('finds only the manual record for the form', () => {
        expect(findManualAchievement(list, '2026')?.id).toBe(1)
        expect(findManualAchievement(list, '2027')).toBeUndefined()
    })

    it('sums manual + integration in the same year', () => {
        expect(sumAchievementsForTahun(list, '2026')).toMatchObject({ sr: 40, kk: 40, jiwa: 200 })
    })
})
