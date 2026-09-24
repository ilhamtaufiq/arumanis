import type { KegiatanStats, SubKegiatanStat } from '@/features/dashboard/types'
import { formatCurrency } from '@/features/dashboard/lib/format'
import {
    buildRekapExportRows,
    groupByKonsolidasi,
    type RekapPekerjaanItem,
} from '@/features/progress/lib/rekap-progress'
import { buildReportPdf } from './laporan-pdf'

async function writeExcelFile(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
    const XLSX = await import('xlsx')
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    XLSX.writeFile(workbook, filename)
}

function stamp(): string {
    return new Date().toISOString().slice(0, 10)
}

/** Unduh Excel realisasi per sub kegiatan (SP2D vs kontrak + fisik). */
export async function exportSubKegiatanExcel(stats: KegiatanStats, tahun: string): Promise<void> {
    const items: SubKegiatanStat[] = stats.subKegiatanStats ?? []
    const rows = items.map((item, index) => ({
        No: index + 1,
        'Sub Kegiatan': item.name,
        'Jumlah Paket': item.count,
        'Pagu (Rp)': Math.round(item.paguM * 1_000_000),
        'Nilai Kontrak (Rp)': Math.round(item.kontrakTotal),
        'Realisasi SP2D (Rp)': Math.round(item.sp2dTotal),
        'Serapan vs Kontrak (%)':
            item.kontrakTotal > 0 ? Number(((item.sp2dTotal / item.kontrakTotal) * 100).toFixed(1)) : null,
        'Fisik Estimasi (%)': item.hasProgress ? item.progress : null,
        Batal: item.batal,
        'Belum Berkontrak': item.belumBerkontrak,
    }))
    await writeExcelFile(`Realisasi_Sub_Kegiatan_${tahun}_${stamp()}.xlsx`, 'Sub Kegiatan', rows)
}

/** Unduh Excel ringkas program (kegiatan, output, penerima). */
export async function exportProgramExcel(stats: KegiatanStats, tahun: string): Promise<void> {
    const summary = [
        { Indikator: 'Total Kegiatan', Nilai: stats.totalKegiatan },
        { Indikator: 'Total Pekerjaan', Nilai: stats.totalPekerjaan },
        { Indikator: 'Total Output', Nilai: stats.totalOutput },
        { Indikator: 'Total Penerima', Nilai: stats.totalPenerima },
        { Indikator: 'Total Jiwa', Nilai: stats.totalJiwa },
        { Indikator: 'Total Kontrak', Nilai: stats.totalKontrak },
        { Indikator: 'Total Pagu Kegiatan (Rp)', Nilai: stats.totalPagu },
        { Indikator: 'Total Pagu Pekerjaan (Rp)', Nilai: stats.totalPaguPekerjaan },
        { Indikator: 'Total Nilai Kontrak (Rp)', Nilai: stats.totalNilaiKontrak },
    ]
    const output = (stats.outputPerKomponen ?? []).map((row) => ({
        Komponen: row.name,
        Jumlah: row.value,
    }))
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), 'Ringkasan')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(output), 'Output')
    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
            (stats.kegiatanPerTahun ?? []).map((row) => ({ Tahun: row.name, Kegiatan: row.value })),
        ),
        'Kegiatan per Tahun',
    )
    XLSX.writeFile(workbook, `Ringkasan_Program_${tahun}_${stamp()}.xlsx`)
}

/** Unduh Excel laporan paket pekerjaan per sub kegiatan. */
export async function exportPaketPekerjaanExcel(stats: KegiatanStats, tahun: string): Promise<void> {
    const items: SubKegiatanStat[] = stats.subKegiatanStats ?? []
    const rows = items.map((item, index) => {
        const pagu = Math.round(item.paguM * 1_000_000)
        const kontrak = Math.round(item.kontrakTotal)
        const realisasi = Math.round(item.sp2dTotal)
        return {
            No: index + 1,
            'Sub Kegiatan': item.name,
            'Total Paket Aktif': item.count + item.belumBerkontrak,
            Batal: item.batal,
            'Belum Berkontrak': item.belumBerkontrak,
            'Total Pagu (Rp)': pagu,
            'Nilai Kontrak (Rp)': kontrak,
            'Realisasi SP2D (Rp)': realisasi,
            'Sisa Kontrak (Rp)': kontrak - realisasi,
            'Sisa Pagu (Rp)': pagu - kontrak,
        }
    })
    await writeExcelFile(`Laporan_Paket_Pekerjaan_${tahun}_${stamp()}.xlsx`, 'Paket Pekerjaan', rows)
}

/** Unduh PDF laporan paket pekerjaan per sub kegiatan. */
export async function exportPaketPekerjaanPdf(stats: KegiatanStats, tahun: string): Promise<void> {
    const items: SubKegiatanStat[] = stats.subKegiatanStats ?? []
    await buildReportPdf({
        title: 'LAPORAN PAKET PEKERJAAN',
        subtitle: `Tahun Anggaran ${tahun}`,
        filename: `Laporan_Paket_Pekerjaan_${tahun}_${stamp()}.pdf`,
        table: {
            head: [['No', 'Sub Kegiatan', 'Paket', 'Batal', 'Blm Kontrak', 'Pagu', 'Kontrak', 'Realisasi', 'Sisa Kontrak', 'Sisa Pagu']],
            body: items.map((item, i) => {
                const pagu = Math.round(item.paguM * 1_000_000)
                const kontrak = Math.round(item.kontrakTotal)
                const realisasi = Math.round(item.sp2dTotal)
                return [
                    String(i + 1),
                    item.name,
                    String(item.count + item.belumBerkontrak),
                    String(item.batal),
                    String(item.belumBerkontrak),
                    formatCurrency(pagu),
                    formatCurrency(kontrak),
                    formatCurrency(realisasi),
                    formatCurrency(kontrak - realisasi),
                    formatCurrency(pagu - kontrak),
                ]
            }),
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 14, halign: 'center' },
                3: { cellWidth: 14, halign: 'center' },
                4: { cellWidth: 18, halign: 'center' },
                5: { cellWidth: 26, halign: 'right' },
                6: { cellWidth: 26, halign: 'right' },
                7: { cellWidth: 26, halign: 'right' },
                8: { cellWidth: 26, halign: 'right' },
                9: { cellWidth: 26, halign: 'right' },
            },
        },
    })
}

/** Unduh PDF rekap progress (kop + tabel sama dengan halaman rekap). */
export async function exportRekapProgressPdf(list: RekapPekerjaanItem[], tahun: string): Promise<void> {
    const rows = buildRekapExportRows(groupByKonsolidasi(list))
    await buildReportPdf({
        title: 'REKAP PROGRES ESTIMASI',
        subtitle: `Tahun Anggaran ${tahun}`,
        filename: `Rekap_Progress_${tahun}_${Date.now()}.pdf`,
        table: {
            head: [['No', 'Nama Paket', 'Pagu', 'Nilai Kontrak', 'Fisik (%)', 'Keuangan (%)']],
            body: rows.map((r, i) => [
                String(i + 1),
                r.namaPaket,
                formatCurrency(r.totalPagu),
                formatCurrency(r.totalKontrak),
                `${r.fisik.toFixed(2)}%`,
                `${r.keuangan.toFixed(2)}%`,
            ]),
            columnStyles: {
                0: { cellWidth: 12, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' },
                4: { cellWidth: 20, halign: 'center' },
                5: { cellWidth: 22, halign: 'center' },
            },
        },
    })
}

/** Unduh PDF realisasi per sub kegiatan. */
export async function exportSubKegiatanPdf(stats: KegiatanStats, tahun: string): Promise<void> {
    const items: SubKegiatanStat[] = stats.subKegiatanStats ?? []
    await buildReportPdf({
        title: 'REALISASI PER SUB KEGIATAN',
        subtitle: `Tahun Anggaran ${tahun}`,
        filename: `Realisasi_Sub_Kegiatan_${tahun}_${stamp()}.pdf`,
        table: {
            head: [['No', 'Sub Kegiatan', 'Paket', 'Pagu', 'Kontrak', 'SP2D', 'Serapan (%)', 'Fisik (%)']],
            body: items.map((item, i) => [
                String(i + 1),
                item.name,
                String(item.count),
                formatCurrency(Math.round(item.paguM * 1_000_000)),
                formatCurrency(Math.round(item.kontrakTotal)),
                formatCurrency(Math.round(item.sp2dTotal)),
                item.kontrakTotal > 0 ? ((item.sp2dTotal / item.kontrakTotal) * 100).toFixed(1) : '-',
                item.hasProgress ? String(item.progress) : '-',
            ]),
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 14, halign: 'center' },
                3: { cellWidth: 28, halign: 'right' },
                4: { cellWidth: 28, halign: 'right' },
                5: { cellWidth: 28, halign: 'right' },
                6: { cellWidth: 20, halign: 'center' },
                7: { cellWidth: 18, halign: 'center' },
            },
        },
    })
}

/** Unduh PDF ringkasan program. */
export async function exportProgramPdf(stats: KegiatanStats, tahun: string): Promise<void> {
    const summary: Array<[string, string]> = [
        ['Total Kegiatan', String(stats.totalKegiatan)],
        ['Total Pekerjaan', String(stats.totalPekerjaan)],
        ['Total Output', String(stats.totalOutput)],
        ['Total Penerima', String(stats.totalPenerima)],
        ['Total Jiwa', String(stats.totalJiwa)],
        ['Total Kontrak', String(stats.totalKontrak)],
        ['Total Pagu Kegiatan', formatCurrency(stats.totalPagu)],
        ['Total Pagu Pekerjaan', formatCurrency(stats.totalPaguPekerjaan)],
        ['Total Nilai Kontrak', formatCurrency(stats.totalNilaiKontrak)],
    ]
    await buildReportPdf({
        title: 'RINGKASAN PROGRAM',
        subtitle: `Tahun Anggaran ${tahun}`,
        filename: `Ringkasan_Program_${tahun}_${stamp()}.pdf`,
        table: {
            head: [['No', 'Indikator', 'Nilai']],
            body: summary.map(([label, value], i) => [String(i + 1), label, value]),
            columnStyles: {
                0: { cellWidth: 12, halign: 'center' },
                1: { cellWidth: 90 },
                2: { cellWidth: 'auto', halign: 'right' },
            },
        },
    })
}
export async function exportRekapProgressExcel(list: RekapPekerjaanItem[], tahun: string): Promise<void> {
    const rows = buildRekapExportRows(groupByKonsolidasi(list)).map((r, index) => ({
        No: index + 1,
        'Nama Paket Pekerjaan': r.namaPaket,
        'Sub Kegiatan': r.subKegiatan,
        Kecamatan: r.kecamatan,
        Desa: r.desa,
        'Pagu (Rp)': r.totalPagu,
        'Nilai Kontrak (Rp)': r.totalKontrak,
        Tags: r.tags,
        'Estimasi Fisik (%)': r.fisik,
        'Realisasi Keuangan (%)': r.keuangan,
    }))
    await writeExcelFile(`Rekap_Progress_${tahun}_${stamp()}.xlsx`, 'Rekap Progress', rows)
}
