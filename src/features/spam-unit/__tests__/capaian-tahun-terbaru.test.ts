import { describe, expect, it } from 'vitest'
import { akumulasiCapaian } from '../lib/achievement-source'
import type { SpamAchievement } from '../types'

const rec = (tahun: string, sumber: string, sr: number) =>
    ({ id: Number(tahun) + sr, unit_spam_id: 1, tahun, sumber, jumlah_sr: sr } as unknown as SpamAchievement)

describe('akumulasiCapaian', () => {
    it('menjumlahkan semua tahun karena capaian per tahun bersifat tambahan', () => {
        const list = [rec('2020', 'manual', 84), rec('2023', 'manual', 83), rec('2026', 'integrasi', 54)]
        expect(akumulasiCapaian(list)).toBe(221)
    })
    it('menjumlahkan manual dan integrasi pada tahun yang sama', () => {
        expect(akumulasiCapaian([rec('2025', 'manual', 10), rec('2025', 'integrasi', 5)])).toBe(15)
    })
    it('nol bila belum ada capaian', () => {
        expect(akumulasiCapaian(undefined)).toBe(0)
    })
})
