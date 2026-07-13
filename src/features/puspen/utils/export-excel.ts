import * as XLSX from 'xlsx'
import type { PuspenProgressFisikItem } from '../api/progress-fisik'
import {
    buildSubKegiatanRekap,
    formatDateId,
    formatUpdatedAt,
    phoLabel,
    type ExportPeriod,
} from './export-shared'

type ExportExcelParams = {
    items: PuspenProgressFisikItem[]
    tahun: number
    period: ExportPeriod
    fileName?: string
}

export function exportProgressFisikExcel({
    items,
    tahun,
    period,
    fileName,
}: ExportExcelParams) {
    if (!items.length) return

    const workbook = XLSX.utils.book_new()
    const periodLabel = `${formatDateId(period.startDate)} s/d ${formatDateId(period.endDate)}`

    // ── Sheet 1: Rekap per sub kegiatan (halaman pertama) ──────────────────
    const rekap = buildSubKegiatanRekap(items)
    const rekapRows: unknown[][] = [
        [`Rekap Progress Fisik per Sub Kegiatan — Tahun ${tahun}`],
        [`Periode laporan: ${periodLabel}`],
        [],
        [
            'No',
            'Sub Kegiatan',
            'Jumlah Paket',
            'Rata-rata Rencana (%)',
            'Rata-rata Realisasi (%)',
            'Rata-rata Deviasi (%)',
            'Pagu',
            'Nilai Kontrak',
            'Sisa Kontrak (Pagu − Nilai Kontrak)',
            'Retensi (5% Nilai Kontrak)',
            'PHO Sudah',
            'PHO Belum',
        ],
    ]

    rekap.forEach((row, index) => {
        rekapRows.push([
            index + 1,
            row.subKegiatan,
            row.count,
            row.rencana,
            row.realisasi,
            row.deviasi,
            row.pagu,
            row.nilaiKontrak,
            row.sisaKontrak,
            row.retensi,
            row.phoSudah,
            row.phoBelum,
        ])
    })

    const totalPagu = rekap.reduce((s, r) => s + r.pagu, 0)
    const totalNilai = rekap.reduce((s, r) => s + r.nilaiKontrak, 0)
    const totalSisa = rekap.reduce((s, r) => s + r.sisaKontrak, 0)
    const totalRetensi = rekap.reduce((s, r) => s + r.retensi, 0)
    const totalPaket = rekap.reduce((s, r) => s + r.count, 0)
    const avgRencana =
        totalPaket > 0 ? rekap.reduce((s, r) => s + r.rencana * r.count, 0) / totalPaket : 0
    const avgRealisasi =
        totalPaket > 0 ? rekap.reduce((s, r) => s + r.realisasi * r.count, 0) / totalPaket : 0

    rekapRows.push([])
    rekapRows.push([
        '',
        'TOTAL / RATA-RATA',
        totalPaket,
        Number(avgRencana.toFixed(2)),
        Number(avgRealisasi.toFixed(2)),
        Number((avgRealisasi - avgRencana).toFixed(2)),
        totalPagu,
        totalNilai,
        totalSisa,
        totalRetensi,
        rekap.reduce((s, r) => s + r.phoSudah, 0),
        rekap.reduce((s, r) => s + r.phoBelum, 0),
    ])

    const wsRekap = XLSX.utils.aoa_to_sheet(rekapRows)
    wsRekap['!cols'] = [
        { wch: 5 },
        { wch: 40 },
        { wch: 12 },
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
    ]
    XLSX.utils.book_append_sheet(workbook, wsRekap, 'Rekap Sub Kegiatan')

    // ── Sheet 2: Detail per paket ──────────────────────────────────────────
    const detailRows: unknown[][] = [
        [`Detail Progress Fisik per Paket — Tahun ${tahun}`],
        [`Periode laporan: ${periodLabel}`],
        [],
        [
            'No',
            'Nama Paket Pekerjaan',
            'Kode Paket',
            'Sub Kegiatan',
            'Rencana (%)',
            'Realisasi (%)',
            'Deviasi (%)',
            'Pagu',
            'Nilai Kontrak',
            'Sisa Kontrak',
            'Retensi (5%)',
            'PHO',
            'Terakhir Update',
        ],
    ]

    items.forEach((item, index) => {
        detailRows.push([
            index + 1,
            item.namaPaket || '-',
            item.kodePaket || '-',
            item.subKegiatan || '-',
            item.rencana ?? '-',
            item.realisasi ?? '-',
            item.deviasi ?? '-',
            item.pagu ?? 0,
            item.nilaiKontrak ?? 0,
            item.sisaKontrak ?? 0,
            item.retensi ?? 0,
            phoLabel(item.phoCompleted),
            formatUpdatedAt(item.updatedAt),
        ])
    })

    const wsDetail = XLSX.utils.aoa_to_sheet(detailRows)
    wsDetail['!cols'] = [
        { wch: 5 },
        { wch: 40 },
        { wch: 18 },
        { wch: 30 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 10 },
        { wch: 20 },
    ]
    XLSX.utils.book_append_sheet(workbook, wsDetail, 'Detail Paket')

    const defaultName = `progress-fisik-${tahun}-${period.startDate}_${period.endDate}.xlsx`
    XLSX.writeFile(workbook, fileName || defaultName)
}
