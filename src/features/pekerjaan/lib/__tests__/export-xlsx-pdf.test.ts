import { describe, expect, it } from 'bun:test'
import * as XLSX from 'xlsx'
import { workbookKePdf } from '../export-xlsx-pdf'

function buatWorkbook(sheets: Record<string, (string | number)[][]>): XLSX.WorkBook {
    const wb = XLSX.utils.book_new()
    for (const [nama, rows] of Object.entries(sheets)) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), nama)
    }
    return wb
}

describe('workbookKePdf', () => {
    it('mencetak semua sheet, masing-masing mulai di halaman baru', () => {
        const wb = buatWorkbook({
            'RAB Utama': [['No', 'Uraian', 'Volume', 'Satuan'], [1, 'Galian tanah', 12.5, 'm3']],
            'Rekap': [['Total'], ['Rp 1.000.000']],
        })
        const doc = workbookKePdf(wb, 'rab.xlsx')
        expect(doc.getNumberOfPages()).toBe(2)
    })

    it('melewati sheet yang disembunyikan dan sheet kosong', () => {
        const wb = buatWorkbook({
            'Terlihat': [['No', 'Uraian', 'Volume'], [1, 'Pipa', 3]],
            'Kosong': [[]],
            'Tersembunyi': [['A', 'B', 'C'], [1, 2, 3]],
        })
        wb.Workbook = { Sheets: [{ Hidden: 0 }, { Hidden: 0 }, { Hidden: 1 }] }
        const doc = workbookKePdf(wb, 'rab.xlsx')
        expect(doc.getNumberOfPages()).toBe(1)
    })

    it('sheet lebar memakai landscape, sheet sempit memakai portrait', () => {
        const lebar = buatWorkbook({
            'Sempit': [['No', 'Uraian'], [1, 'Pipa']],
            'Lebar': [['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], [1, 2, 3, 4, 5, 6, 7, 8]],
        })
        const doc = workbookKePdf(lebar, 'rab.xlsx')
        doc.setPage(1)
        expect(doc.internal.pageSize.getWidth()).toBeLessThan(doc.internal.pageSize.getHeight())
        doc.setPage(2)
        expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(doc.internal.pageSize.getHeight())
    })

    it('menolak workbook tanpa isi', () => {
        const wb = buatWorkbook({ 'Kosong': [[]] })
        expect(() => workbookKePdf(wb, 'rab.xlsx')).toThrow('tidak punya isi')
    })
})
