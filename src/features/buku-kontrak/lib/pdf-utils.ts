import { PDFDocument } from 'pdf-lib'

/** Satu berkas PDF yang sudah dibaca. `bytes` disimpan untuk dipakai ulang saat digabung. */
export type SumberPdf = {
    id: string
    nama: string
    bytes: ArrayBuffer
    jumlahHalaman: number
}

/** Halaman yang dipilih dari satu sumber. Nomor halaman berbasis nol. */
export type PilihanHalaman = {
    sumberId: string
    halaman: number[]
}

/** Baca PDF dari berkas. PDF terkunci password atau rusak akan melempar galat. */
export async function bacaPdf(file: File): Promise<SumberPdf> {
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes)
    return {
        id: crypto.randomUUID(),
        nama: file.name,
        bytes,
        jumlahHalaman: doc.getPageCount(),
    }
}

/** Sumber PDF dari bytes yang sudah ada, misalnya hasil konversi atau unduhan berkas. */
export async function sumberDariPdfBytes(nama: string, bytes: ArrayBuffer): Promise<SumberPdf> {
    const doc = await PDFDocument.load(bytes)
    return {
        id: crypto.randomUUID(),
        nama,
        bytes,
        jumlahHalaman: doc.getPageCount(),
    }
}

/**
 * Gabungkan halaman terpilih sesuai urutan `pilihan`. Hasilnya satu PDF baru, dan sumber tidak diubah.
 */
export async function gabungkanPdf(sumber: SumberPdf[], pilihan: PilihanHalaman[]): Promise<Uint8Array> {
    const hasil = await PDFDocument.create()
    const dibuka = new Map<string, PDFDocument>()

    for (const grup of pilihan) {
        if (grup.halaman.length === 0) continue
        const src = sumber.find((s) => s.id === grup.sumberId)
        if (!src) continue
        let doc = dibuka.get(src.id)
        if (!doc) {
            doc = await PDFDocument.load(src.bytes)
            dibuka.set(src.id, doc)
        }
        const salinan = await hasil.copyPages(doc, grup.halaman)
        salinan.forEach((halaman) => hasil.addPage(halaman))
    }

    if (hasil.getPageCount() === 0) {
        throw new Error('Tidak ada halaman yang dipilih.')
    }
    return hasil.save()
}
