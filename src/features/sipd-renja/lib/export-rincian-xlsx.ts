import * as XLSX from 'xlsx'
import { downloadBlob } from '@/lib/download-file'
import type { SipdRincianRow } from '@/features/sipd-renja/types'
import type { HasilLokasi, StatLokasi } from '@/features/sipd-renja/lib/lokasi-wilayah'

export type ExportRincianMeta = {
    subKegiatan: string
    tahun?: number | string | null
}

const num = (v: unknown): number | string => {
    if (v === null || v === undefined || v === '') return ''
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
    return Number.isFinite(n) ? n : String(v)
}

/**
 * Workbook export rincian SIPD: sheet "Rincian" (per baris, dengan sebelum dan sesudah perubahan)
 * dan sheet "Statistik" (ringkasan lokasi, per kecamatan, dan per desa).
 */
export function buatWorkbookRincian(
    rows: SipdRincianRow[],
    lokasiByRinci: Map<number, HasilLokasi>,
    stat: StatLokasi,
    meta: ExportRincianMeta,
): XLSX.WorkBook {
    const judul = `Rincian ${meta.subKegiatan}${meta.tahun ? ` · TA ${meta.tahun}` : ''}`

    const header = [
        'No',
        'Uraian Sub BL',
        'Keterangan',
        'Desa',
        'Kecamatan',
        'Kode Rekening',
        'Nama Rekening',
        'Nama Standar Harga',
        'Spesifikasi',
        'Koef. Sebelum',
        'Harga Satuan Sebelum',
        'Total Sebelum',
        'Koef. Sesudah',
        'Harga Satuan Sesudah',
        'Total Sesudah',
    ]
    const isi = rows.map((r, i) => {
        const lokasi = lokasiByRinci.get(Number(r.id_rinci_sub_bl))
        return [
            i + 1,
            r.subs_bl_teks ?? '',
            r.ket_bl_teks ?? '',
            lokasi?.desa ?? '',
            lokasi?.kecamatan ?? '',
            r.kode_akun ?? '',
            r.nama_akun ?? '',
            r.nama_standar_harga ?? '',
            r.spek ?? '',
            num(r.koefisien_murni),
            num(r.harga_satuan_murni),
            num(r.total_harga_murni),
            num(r.koefisien),
            num(r.harga_satuan),
            num(r.total_harga),
        ]
    })
    const sheetRincian = XLSX.utils.aoa_to_sheet([[judul], [], header, ...isi])
    sheetRincian['!cols'] = [
        { wch: 5 }, { wch: 36 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 28 }, { wch: 24 },
        { wch: 24 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
    ]
    sheetRincian['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } }]

    const statRows: (string | number)[][] = [
        ['Statistik lokasi', meta.subKegiatan],
        [],
        ['Baris berlokasi', stat.berlokasi],
        ['Baris tidak cocok dengan master', stat.tanpaLokasi],
        [],
        ['Per kecamatan'],
        ['Kecamatan', 'Jumlah lokasi'],
        ...stat.perKecamatan.map((k) => [k.kecamatan, k.jumlah]),
        [],
        ['Per desa'],
        ['Desa', 'Kecamatan', 'Jumlah lokasi'],
        ...stat.perDesa.map((d) => [d.desa, d.kecamatan ?? '-', d.jumlah]),
    ]
    const sheetStat = XLSX.utils.aoa_to_sheet(statRows)
    sheetStat['!cols'] = [{ wch: 34 }, { wch: 24 }, { wch: 14 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheetRincian, 'Rincian')
    XLSX.utils.book_append_sheet(wb, sheetStat, 'Statistik')
    return wb
}

/** Unduh workbook rincian sebagai .xlsx. */
export function unduhRincianXlsx(
    rows: SipdRincianRow[],
    lokasiByRinci: Map<number, HasilLokasi>,
    stat: StatLokasi,
    meta: ExportRincianMeta,
): void {
    const wb = buatWorkbookRincian(rows, lokasiByRinci, stat, meta)
    const bytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
    const nama = meta.subKegiatan.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'rincian'
    downloadBlob(
        new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `Rincian_${nama}${meta.tahun ? `_${meta.tahun}` : ''}.xlsx`,
    )
}
