import { describe, expect, it } from 'vitest'
import { capaianTahunTerbaru } from '../lib/achievement-source'
import type { SpamAchievement } from '../types'

const rec = (tahun: string, sumber: string, sr: number) =>
    ({ id: Number(tahun) + sr, unit_spam_id: 1, tahun, sumber, jumlah_sr: sr } as unknown as SpamAchievement)

describe('capaianTahunTerbaru', () => {
    it('mengambil tahun terbaru, bukan baris pertama', () => {
        const list = [rec('2020', 'manual', 84), rec('2023', 'manual', 83), rec('2026', 'integrasi', 54)]
        expect(capaianTahunTerbaru(list)).toEqual({ tahun: '2026', sr: 54 })
    })
    it('menjumlahkan manual dan integrasi pada tahun yang sama', () => {
        const list = [rec('2025', 'manual', 10), rec('2025', 'integrasi', 5)]
        expect(capaianTahunTerbaru(list)).toEqual({ tahun: '2025', sr: 15 })
    })
    it('kosong bila belum ada capaian', () => {
        expect(capaianTahunTerbaru(undefined)).toEqual({ tahun: null, sr: 0 })
    })
})
