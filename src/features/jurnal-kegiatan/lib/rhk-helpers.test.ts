import { describe, expect, it } from 'vitest'
import { filenameFromDisposition } from '@/lib/download-file'
import {
    emptyRhkRow,
    nextRhkNo,
    normalizeRencana,
    optionalQueryText,
    parseStrategi,
    rowsToRhkItems,
    validateRhkRows,
} from './rhk-helpers'

describe('normalizeRencana', () => {
    it('selalu menghasilkan 12 angka', () => {
        expect(normalizeRencana([1, 2])).toEqual([1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        expect(normalizeRencana(Array.from({ length: 14 }, (_, i) => i))).toHaveLength(12)
    })

    it('mengganti nilai tak valid dengan 0', () => {
        expect(normalizeRencana(['5', 'abc', -3, null, 2.5])).toEqual([5, 0, 0, 0, 2.5, 0, 0, 0, 0, 0, 0, 0])
    })
})

describe('validateRhkRows', () => {
    it('menolak nama kosong, target negatif, satuan kosong, dan nomor ganda', () => {
        const rows = [
            { ...emptyRhkRow(1, 'a'), rhk: '', target: '10' },
            { ...emptyRhkRow(1, 'b'), rhk: 'Rapat', target: '-1', satuan: ' ' },
        ]
        const errors = validateRhkRows(rows)
        expect(errors.a.rhk).toBeDefined()
        expect(errors.a.no).toBeUndefined()
        expect(errors.b.target).toBeDefined()
        expect(errors.b.satuan).toBeDefined()
        expect(errors.b.no).toContain('1')
    })

    it('menerima baris lengkap dan rencana kosong dianggap 0', () => {
        const row = { ...emptyRhkRow(3, 'c'), rhk: 'Laporan', target: '12' }
        expect(validateRhkRows([row])).toEqual({})
        expect(rowsToRhkItems([row])).toEqual([
            { no: 3, rhk: 'Laporan', target: 12, satuan: 'Dokumen', rencana: Array(12).fill(0) },
        ])
    })
})

describe('nextRhkNo', () => {
    it('memakai nomor terbesar + 1 agar nomor yang dihapus tidak terpakai ulang', () => {
        expect(nextRhkNo([])).toBe(1)
        expect(nextRhkNo([{ no: 1 }, { no: 4 }])).toBe(5)
    })
})

describe('parseStrategi and optionalQueryText', () => {
    it('merapikan daftar strategi yang dipisah titik koma', () => {
        expect(parseStrategi(' a ; b;; c ')).toBe('a;b;c')
        expect(parseStrategi('  ;  ')).toBeUndefined()
    })

    it('mengembalikan undefined untuk teks kosong', () => {
        expect(optionalQueryText('   ')).toBeUndefined()
        expect(optionalQueryText(' catatan ')).toBe('catatan')
    })
})

describe('nama berkas dari Content-Disposition', () => {
    it('membaca filename biasa dan filename* UTF-8', () => {
        expect(filenameFromDisposition('attachment; filename="laporan-skp-10-2026.pptx"', 'laporan-skp.pptx')).toBe(
            'laporan-skp-10-2026.pptx',
        )
        expect(filenameFromDisposition("attachment; filename*=UTF-8''laporan%20skp.pptx", 'laporan-skp.pptx')).toBe(
            'laporan skp.pptx',
        )
        expect(filenameFromDisposition(null, 'laporan-skp.pptx')).toBe('laporan-skp.pptx')
    })
})
