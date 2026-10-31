import { PDFDocument } from 'pdf-lib'
import * as XLSX from 'xlsx'
import api from '@/lib/api-client'
import { workbookKePdf } from '@/features/pekerjaan/lib/export-xlsx-pdf'
import { sumberDariPdfBytes, type SumberPdf } from './pdf-utils'

/** Gambar yang bisa langsung ditanam ke PDF. */
const GAMBAR_LANGSUNG = ['jpg', 'jpeg', 'png']
/** Gambar lain: diubah ke PNG di browser lebih dulu. */
const GAMBAR_LAIN = ['webp', 'gif', 'bmp']
/** Spreadsheet: dibuat PDF di browser, memakai generator Excel yang sudah ada. */
const SHEET = ['xlsx', 'xls', 'csv']
/** Dokumen: dikonversi di server lewat ONLYOFFICE. */
const DOKUMEN_SERVER = ['docx', 'doc', 'odt', 'rtf', 'txt', 'pptx', 'ppt', 'odp', 'ods']

export const EKSTENSI_DIDUKUNG = ['pdf', ...GAMBAR_LANGSUNG, ...GAMBAR_LAIN, ...SHEET, ...DOKUMEN_SERVER]

export function ekstensiNama(nama: string): string {
    const i = nama.lastIndexOf('.')
    return i < 0 ? '' : nama.slice(i + 1).toLowerCase()
}

export function didukung(nama: string): boolean {
    return EKSTENSI_DIDUKUNG.includes(ekstensiNama(nama))
}

const A4_PORTRAIT: [number, number] = [595.28, 841.89]
const A4_LANDSCAPE: [number, number] = [841.89, 595.28]
const MARGIN = 24

function ke_array_buffer(u: Uint8Array): ArrayBuffer {
    return u.slice().buffer as ArrayBuffer
}

/** Satu gambar di tengah halaman A4, diperkecil agar muat tanpa terpotong. */
async function gambarKePdf(bytes: ArrayBuffer, ext: 'jpg' | 'png'): Promise<ArrayBuffer> {
    const doc = await PDFDocument.create()
    const img = ext === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    const [w, h] = img.width > img.height ? A4_LANDSCAPE : A4_PORTRAIT
    const page = doc.addPage([w, h])
    const skala = Math.min((w - 2 * MARGIN) / img.width, (h - 2 * MARGIN) / img.height)
    const dw = img.width * skala
    const dh = img.height * skala
    page.drawImage(img, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh })
    return ke_array_buffer(await doc.save())
}

/** Ubah gambar apa pun yang bisa dibaca browser menjadi PNG. */
async function gambarKePng(bytes: ArrayBuffer): Promise<ArrayBuffer> {
    const bitmap = await createImageBitmap(new Blob([bytes]))
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas tidak tersedia.')
    ctx.drawImage(bitmap, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gambar tidak bisa diubah.'))), 'image/png'),
    )
    return blob.arrayBuffer()
}

async function sheetKePdf(file: File): Promise<ArrayBuffer> {
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const doc = workbookKePdf(wb, file.name)
    return doc.output('arraybuffer')
}

async function dokumenKeServer(file: File): Promise<ArrayBuffer> {
    const fd = new FormData()
    fd.append('file', file)
    const blob = await api.post<Blob>('/buku-kontrak/konversi', fd, { responseType: 'blob' })
    return blob.arrayBuffer()
}

/**
 * Ubah satu berkas apa pun (PDF, gambar, spreadsheet, atau dokumen) menjadi sumber PDF.
 * PDF dipakai apa adanya. Format lain diubah dulu, lalu siap digabung.
 */
export async function ubahKePdf(file: File): Promise<SumberPdf> {
    const ext = ekstensiNama(file.name)
    if (!didukung(file.name)) {
        throw new Error(`format .${ext || '?'} belum didukung.`)
    }

    let bytes: ArrayBuffer
    if (ext === 'pdf') {
        bytes = await file.arrayBuffer()
    } else if (ext === 'jpg' || ext === 'jpeg') {
        bytes = await gambarKePdf(await file.arrayBuffer(), 'jpg')
    } else if (ext === 'png') {
        bytes = await gambarKePdf(await file.arrayBuffer(), 'png')
    } else if (GAMBAR_LAIN.includes(ext)) {
        bytes = await gambarKePdf(await gambarKePng(await file.arrayBuffer()), 'png')
    } else if (SHEET.includes(ext)) {
        bytes = await sheetKePdf(file)
    } else {
        bytes = await dokumenKeServer(file)
    }

    const stem = file.name.replace(/\.[^.]+$/, '')
    return sumberDariPdfBytes(`${stem}.pdf`, bytes)
}
