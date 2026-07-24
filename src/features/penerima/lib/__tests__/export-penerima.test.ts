import { describe, expect, it, mock } from 'bun:test'

// Mock write/save side-effects so unit test stays pure.
mock.module('xlsx', () => {
    const utils = {
        json_to_sheet: (rows: unknown[]) => ({ rows, '!cols': undefined as unknown }),
        book_new: () => ({ sheets: [] as unknown[] }),
        book_append_sheet: (wb: { sheets: unknown[] }, sheet: unknown, name: string) => {
            wb.sheets.push({ sheet, name })
        },
    }
    return {
        utils,
        writeFile: mock(() => undefined),
    }
})

mock.module('jspdf', () => {
    class jsPDF {
        setFontSize() {}
        setFont() {}
        text() {}
        save = mock(() => undefined)
        internal = { pageSize: { getWidth: () => 297 } }
    }
    return { default: jsPDF }
})

mock.module('jspdf-autotable', () => ({
    default: mock(() => undefined),
}))

const { exportPenerimaExcel, exportPenerimaPdf } = await import('../export-penerima')

const sample = [
    {
        id: 1,
        nama: 'Budi',
        nik: '3203010101010001',
        alamat: 'Cianjur',
        jumlah_jiwa: 4,
        is_komunal: false,
    },
    {
        id: 2,
        nama: 'Komunal A',
        nik: null,
        alamat: null,
        jumlah_jiwa: 0,
        is_komunal: true,
    },
]

describe('exportPenerima', () => {
    it('throws when data empty (excel)', () => {
        expect(() => exportPenerimaExcel([])).toThrow('Tidak ada data penerima')
    })

    it('throws when data empty (pdf)', () => {
        expect(() => exportPenerimaPdf([])).toThrow('Tidak ada data penerima')
    })

    it('exports excel without throwing', () => {
        expect(() =>
            exportPenerimaExcel(sample, { pekerjaanName: 'Paket SR Desa Contoh' }),
        ).not.toThrow()
    })

    it('exports pdf without throwing', () => {
        expect(() =>
            exportPenerimaPdf(sample, { pekerjaanName: 'Paket SR Desa Contoh' }),
        ).not.toThrow()
    })
})
