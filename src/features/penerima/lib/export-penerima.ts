import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getPenerimaList } from '../api'
import type { Penerima } from '../types'
import { fetchAllPages } from '@/lib/paginated-fetch'

export type PenerimaExportRow = Pick<
    Penerima,
    'id' | 'nama' | 'nik' | 'alamat' | 'jumlah_jiwa' | 'is_komunal'
>

function dateStamp() {
    return new Date().toISOString().split('T')[0]
}

function slugify(value: string) {
    return value
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 60) || 'pekerjaan'
}

function toRows(data: PenerimaExportRow[]) {
    return data.map((item, index) => ({
        No: index + 1,
        Nama: item.nama,
        NIK: item.nik || '-',
        Alamat: item.alamat || '-',
        'Jumlah Jiwa': item.jumlah_jiwa ?? 0,
        Tipe: item.is_komunal ? 'Komunal' : 'Individual',
    }))
}

/** Ambil seluruh penerima untuk satu pekerjaan (paginate API). */
export async function fetchAllPenerimaByPekerjaan(pekerjaanId: number): Promise<Penerima[]> {
    return fetchAllPages((page) =>
        getPenerimaList({
            pekerjaan_id: pekerjaanId,
            page,
            per_page: 100,
        }),
    )
}

export function exportPenerimaExcel(
    data: PenerimaExportRow[],
    options?: { pekerjaanName?: string; filename?: string },
) {
    if (!data.length) {
        throw new Error('Tidak ada data penerima untuk diekspor')
    }

    const rows = toRows(data)
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 20 },
        { wch: 40 },
        { wch: 12 },
        { wch: 12 },
    ]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penerima')

    const label = options?.pekerjaanName ? slugify(options.pekerjaanName) : 'pekerjaan'
    const filename = options?.filename ?? `Penerima_${label}_${dateStamp()}.xlsx`
    XLSX.writeFile(workbook, filename)
}

export function exportPenerimaPdf(
    data: PenerimaExportRow[],
    options?: { pekerjaanName?: string; filename?: string },
) {
    if (!data.length) {
        throw new Error('Tidak ada data penerima untuk diekspor')
    }

    const doc = new jsPDF('landscape')
    const title = 'DAFTAR PENERIMA MANFAAT'
    const metaParts = [
        options?.pekerjaanName ? options.pekerjaanName : null,
        new Date().toLocaleString('id-ID'),
        `${data.length} data`,
    ].filter(Boolean)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 148, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(metaParts.join(' | '), 148, 22, { align: 'center' })

    autoTable(doc, {
        startY: 28,
        head: [['No', 'Nama', 'NIK', 'Alamat', 'Jiwa', 'Tipe']],
        body: data.map((item, index) => [
            String(index + 1),
            item.nama,
            item.nik || '-',
            item.alamat || '-',
            String(item.jumlah_jiwa ?? 0),
            item.is_komunal ? 'Komunal' : 'Individual',
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
        },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 50 },
            2: { cellWidth: 40 },
            3: { cellWidth: 90 },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 28, halign: 'center' },
        },
    })

    const label = options?.pekerjaanName ? slugify(options.pekerjaanName) : 'pekerjaan'
    const filename = options?.filename ?? `Penerima_${label}_${dateStamp()}.pdf`
    doc.save(filename)
}
