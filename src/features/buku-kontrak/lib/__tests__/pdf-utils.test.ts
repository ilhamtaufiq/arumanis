import { describe, expect, it } from 'bun:test'
import { PDFDocument } from 'pdf-lib'
import { gabungkanPdf, type SumberPdf } from '../pdf-utils'

async function buatPdf(jumlahHalaman: number): Promise<ArrayBuffer> {
    const doc = await PDFDocument.create()
    for (let i = 0; i < jumlahHalaman; i++) doc.addPage([300, 400])
    const bytes = await doc.save()
    return bytes.slice().buffer
}

async function sumber(id: string, halaman: number): Promise<SumberPdf> {
    return { id, nama: `${id}.pdf`, bytes: await buatPdf(halaman), jumlahHalaman: halaman }
}

describe('gabungkanPdf', () => {
    it('menggabungkan halaman sesuai urutan pilihan', async () => {
        const a = await sumber('a', 3)
        const b = await sumber('b', 2)
        const hasil = await gabungkanPdf([a, b], [
            { sumberId: 'b', halaman: [1, 0] },
            { sumberId: 'a', halaman: [2] },
        ])
        const doc = await PDFDocument.load(hasil)
        expect(doc.getPageCount()).toBe(3)
    })

    it('melewati halaman yang tidak dipilih dan sumber yang tidak dikenal', async () => {
        const a = await sumber('a', 4)
        const hasil = await gabungkanPdf([a], [
            { sumberId: 'tidak-ada', halaman: [0] },
            { sumberId: 'a', halaman: [0, 3] },
        ])
        const doc = await PDFDocument.load(hasil)
        expect(doc.getPageCount()).toBe(2)
    })

    it('menolak jika tidak ada halaman yang dipilih', async () => {
        const a = await sumber('a', 2)
        await expect(gabungkanPdf([a], [{ sumberId: 'a', halaman: [] }])).rejects.toThrow('Tidak ada halaman')
    })

    it('tidak mengubah sumber asli', async () => {
        const a = await sumber('a', 2)
        const sebelum = a.bytes.byteLength
        await gabungkanPdf([a], [{ sumberId: 'a', halaman: [0] }])
        expect(a.bytes.byteLength).toBe(sebelum)
        expect((await PDFDocument.load(a.bytes)).getPageCount()).toBe(2)
    })
})
