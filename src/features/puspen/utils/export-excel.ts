import * as XLSX from 'xlsx'
import type { PuspenProgressFisikItem } from '../api/progress-fisik'
import {
    buildSubKegiatanRekap,
    filterAndGroupBySubKegiatan,
    flattenGroupedItems,
    formatDateId,
    formatUpdatedAt,
    phoLabel,
    PROGRESS_FISIK_EXPORT_TITLE,
    safeExcelSheetName,
    type ExportOptions,
} from './export-shared'

type ExportExcelParams = {
    items: PuspenProgressFisikItem[]
    tahun: number
    options: ExportOptions
    fileName?: string
}

export function exportProgressFisikExcel({
    items,
    tahun,
    options,
    fileName,
}: ExportExcelParams) {
    const groups = filterAndGroupBySubKegiatan(items, options.subKegiatan)
    const filteredItems = flattenGroupedItems(groups)
    if (!filteredItems.length) return

    const workbook = XLSX.utils.book_new()
    const periodLabel = `${formatDateId(options.period.startDate)} s/d ${formatDateId(options.period.endDate)}`

    // ── Sheet 1: Rekap per sub kegiatan ───────────────────────────────────
    const rekap = buildSubKegiatanRekap(filteredItems)
    const rekapOrder = new Map(options.subKegiatan.map((name, i) => [name, i]))
    rekap.sort(
        (a, b) =>
            (rekapOrder.get(a.subKegiatan) ?? 999) - (rekapOrder.get(b.subKegiatan) ?? 999),
    )

    const rekapRows: unknown[][] = [
        [PROGRESS_FISIK_EXPORT_TITLE],
        [`Rekap Progress Fisik per Sub Kegiatan — Tahun ${tahun}`],
        [`Periode laporan: ${periodLabel}`],
        [`Sub kegiatan diexport: ${groups.map((g) => g.subKegiatan).join('; ')}`],
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

    // ── Sheet per sub kegiatan ────────────────────────────────────────────
    const usedNames = new Set<string>(['Rekap Sub Kegiatan'])
    groups.forEach((group, groupIndex) => {
        let sheetName = safeExcelSheetName(group.subKegiatan, groupIndex)
        if (usedNames.has(sheetName)) {
            sheetName = safeExcelSheetName(`${groupIndex + 1} ${group.subKegiatan}`, groupIndex)
        }
        usedNames.add(sheetName)

        const rows: unknown[][] = [
            [PROGRESS_FISIK_EXPORT_TITLE],
            [`Detail: ${group.subKegiatan} — Tahun ${tahun}`],
            [`Periode laporan: ${periodLabel}`],
            [],
            [
                'No',
                'Nama Paket Pekerjaan',
                'Kode Paket',
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

        group.items.forEach((item, index) => {
            rows.push([
                index + 1,
                item.namaPaket || '-',
                item.kodePaket || '-',
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

        const gRekap = buildSubKegiatanRekap(group.items)[0]
        if (gRekap) {
            rows.push([])
            rows.push([
                '',
                'SUBTOTAL / RATA-RATA',
                '',
                gRekap.rencana,
                gRekap.realisasi,
                gRekap.deviasi,
                gRekap.pagu,
                gRekap.nilaiKontrak,
                gRekap.sisaKontrak,
                gRekap.retensi,
                `${gRekap.phoSudah} Sudah / ${gRekap.phoBelum} Belum`,
                '',
            ])
        }

        const ws = XLSX.utils.aoa_to_sheet(rows)
        ws['!cols'] = [
            { wch: 5 },
            { wch: 40 },
            { wch: 18 },
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
        XLSX.utils.book_append_sheet(workbook, ws, sheetName)
    })

    const defaultName = `progress-fisik-${tahun}-${options.period.startDate}_${options.period.endDate}.xlsx`
    XLSX.writeFile(workbook, fileName || defaultName)
}
