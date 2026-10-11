import { describe, expect, it } from 'vitest'
import type { JurnalEntry } from '../types'
import { buildMonthGrid, calendarCellLabel, dayPreview } from './calendar-helpers'

const entry = (id: number, tanggal: string, rhk: number | null = null, foto = 0): JurnalEntry => ({
    id,
    tanggal,
    rhk,
    kegiatan: `Kegiatan ${id}`,
    output: null,
    satuan: null,
    keterangan: null,
    foto: Array.from({ length: foto }, (_, i) => ({ id: i + 1, url: '/u', thumb: '/t' })),
    created_at: '',
    updated_at: '',
})

const inMonthCount = (cells: ReturnType<typeof buildMonthGrid>) => cells.filter((c) => c.inMonth).length

describe('buildMonthGrid', () => {
    it('selalu 42 sel dan dimulai hari Senin', () => {
        const cells = buildMonthGrid(2026, 10, [])
        expect(cells).toHaveLength(42)
        // 1 Oktober 2026 adalah Kamis, jadi sel pertama adalah Senin 28 September.
        expect(cells[0].iso).toBe('2026-09-28')
        expect(new Date(cells[0].iso + 'T00:00:00').getDay()).toBe(1)
    })

    it('bulan yang dimulai hari Minggu (Februari 2026) mulai dari Senin 26 Januari', () => {
        // 1 Februari 2026 adalah Minggu, jadi enam hari minggu sebelumnya masuk ke baris pertama.
        const cells = buildMonthGrid(2026, 2, [])
        expect(cells[0].iso).toBe('2026-01-26')
        expect(cells[0].inMonth).toBe(false)
        expect(cells[6].iso).toBe('2026-02-01')
        expect(cells[6].inMonth).toBe(true)
        expect(cells[41].iso).toBe('2026-03-08')
    })

    it('tahun kabisat: Februari 2028 punya 29 hari di dalam bulan', () => {
        expect(inMonthCount(buildMonthGrid(2028, 2, []))).toBe(29)
    })

    it('Februari 2027 (bukan kabisat) punya 28 hari di dalam bulan', () => {
        expect(inMonthCount(buildMonthGrid(2027, 2, []))).toBe(28)
    })

    it('menandai hari ini tepat satu kali, dan hanya jika ada di bulan yang tampil', () => {
        const cells = buildMonthGrid(2026, 10, [], new Date(2026, 9, 10))
        const today = cells.filter((c) => c.isToday)
        expect(today).toHaveLength(1)
        expect(today[0].iso).toBe('2026-10-10')
        expect(buildMonthGrid(2026, 11, [], new Date(2026, 9, 10)).some((c) => c.isToday)).toBe(false)
    })

    it('mengelompokkan kegiatan per tanggal dan menandai foto', () => {
        const cells = buildMonthGrid(
            2026,
            10,
            [entry(1, '2026-10-05', 2), entry(2, '2026-10-05', null, 1), entry(3, '2026-10-06')],
            new Date(2026, 9, 1),
        )
        const day5 = cells.find((c) => c.iso === '2026-10-05')!
        expect(day5.entries.map((e) => e.id)).toEqual([1, 2])
        expect(day5.hasFoto).toBe(true)
        expect(cells.find((c) => c.iso === '2026-10-06')!.hasFoto).toBe(false)
    })

    it('kegiatan dari luar bulan yang tampil tidak masuk sel', () => {
        const cells = buildMonthGrid(2026, 10, [entry(9, '2026-09-30')], new Date(2026, 9, 1))
        expect(cells.every((c) => c.entries.length === 0)).toBe(true)
    })
})

describe('dayPreview', () => {
    it('menampilkan maksimal dua baris dan menghitung sisanya', () => {
        const preview = dayPreview([entry(1, '2026-10-05', 1), entry(2, '2026-10-05'), entry(3, '2026-10-05', 3)])
        expect(preview.lines).toHaveLength(2)
        expect(preview.lines[0].text).toBe('RHK 1 · Kegiatan 1')
        expect(preview.lines[1].text).toBe('– · Kegiatan 2')
        expect(preview.remaining).toBe(1)
    })
})

describe('calendarCellLabel', () => {
    it('menyebut tanggal, jumlah kegiatan, dan hari ini', () => {
        const [cell] = buildMonthGrid(2026, 10, [entry(1, '2026-10-10')], new Date(2026, 9, 10)).filter((c) => c.iso === '2026-10-10')
        expect(calendarCellLabel(cell, '10/10/2026')).toBe('10/10/2026, 1 kegiatan, hari ini')
        const empty = buildMonthGrid(2026, 10, [], new Date(2026, 9, 1)).find((c) => c.iso === '2026-10-20')!
        expect(calendarCellLabel(empty, '20/10/2026')).toBe('20/10/2026, tidak ada kegiatan')
    })
})
