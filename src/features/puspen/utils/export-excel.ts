import * as XLSX from 'xlsx'
import type { PuspenProgressFisikItem, PuspenUncontractedPekerjaan } from '../api/progress-fisik'
import {
    buildSubKegiatanRekap,
    DEFAULT_EXPORT_FINANCIAL_COLUMNS,
    financialHeaderLabels,
    financialNumericCells,
    flattenGroupedItems,
    formatDateId,
    formatUpdatedAt,
    phoLabel,
    prepareItemsForExportWithUncontracted,
    PROGRESS_FISIK_EXPORT_TITLE,
    safeExcelSheetName,
    type ExportOptions,
} from './export-shared'

type ExportExcelParams = {
    items: PuspenProgressFisikItem[]
    tahun: number
    options: ExportOptions
    uncontractedPekerjaan?: PuspenUncontractedPekerjaan[]
    fileName?: string
}

export function exportProgressFisikExcel({
    items,
    tahun,
    options,
    uncontractedPekerjaan = [],
    fileName,
}: ExportExcelParams) {
    const { groups, uncontractedFiltered } = prepareItemsForExportWithUncontracted(
        items,
        uncontractedPekerjaan,
        tahun,
        options,
    )
    const filteredItems = flattenGroupedItems(groups)
    if (!filteredItems.length && uncontractedFiltered.length === 0) return

    const fin = options.financialColumns ?? DEFAULT_EXPORT_FINANCIAL_COLUMNS
    const finHeaders = financialHeaderLabels(fin, 'long')
    const finShort = financialHeaderLabels(fin, 'short')

    const workbook = XLSX.utils.book_new()
    const periodLabel = `${formatDateId(options.period.startDate)} s/d ${formatDateId(options.period.endDate)}`

    // ── Sheet 1: Rekap sub kegiatan ───────────────────────────────────────
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
        [
            'Data progres: status s.d. tanggal akhir periode (belum diupdate = 0% / Belum PHO)',
        ],
        [`Sub kegiatan diexport: ${groups.map((g) => g.subKegiatan).join('; ')}`],
        [`Paket belum berkontrak: ${uncontractedFiltered.length}`],
        [],
        [
            'No',
            'Sub Kegiatan',
            'Jumlah Paket',
            'Rata-rata Rencana (%)',
            'Rata-rata Realisasi (%)',
            'Rata-rata Deviasi (%)',
            ...finHeaders,
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
            ...financialNumericCells(fin, row),
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
        ...financialNumericCells(fin, {
            pagu: totalPagu,
            nilaiKontrak: totalNilai,
            sisaKontrak: totalSisa,
            retensi: totalRetensi,
        }),
        rekap.reduce((s, r) => s + r.phoSudah, 0),
        rekap.reduce((s, r) => s + r.phoBelum, 0),
    ])

    const finColWidth = finShort.map(() => ({ wch: 16 }))
    const wsRekap = XLSX.utils.aoa_to_sheet(rekapRows)
    wsRekap['!cols'] = [
        { wch: 5 },
        { wch: 40 },
        { wch: 12 },
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
        ...finColWidth,
        { wch: 12 },
        { wch: 12 },
    ]
    XLSX.utils.book_append_sheet(workbook, wsRekap, 'Rekap Sub Kegiatan')

    // ── Sheet 2: Belum berkontrak ─────────────────────────────────────────
    const uncRows: unknown[][] = [
        [PROGRESS_FISIK_EXPORT_TITLE],
        [`Rekap Paket Belum Berkontrak — Tahun ${tahun}`],
        [`Periode laporan: ${periodLabel}`],
        [`Jumlah: ${uncontractedFiltered.length} paket`],
        [],
        [
            'No',
            'Nama Paket',
            'Kode Rekening',
            'Sub Kegiatan',
            'Kecamatan',
            'Desa',
            'Pagu',
            'Status',
        ],
    ]

    uncontractedFiltered.forEach((row, index) => {
        uncRows.push([
            index + 1,
            row.namaPaket || '-',
            row.kodeRekening || '-',
            row.subKegiatan || 'Tanpa Sub Kegiatan',
            row.kecamatan || '-',
            row.desa || '-',
            row.pagu ?? 0,
            'Belum berkontrak',
        ])
    })

    if (uncontractedFiltered.length > 0) {
        uncRows.push([])
        uncRows.push([
            '',
            'TOTAL',
            '',
            `${uncontractedFiltered.length} paket`,
            '',
            '',
            uncontractedFiltered.reduce((s, r) => s + (r.pagu ?? 0), 0),
            '',
        ])
    } else {
        uncRows.push([])
        uncRows.push(['', 'Tidak ada paket belum berkontrak pada filter ini.'])
    }

    const wsUnc = XLSX.utils.aoa_to_sheet(uncRows)
    wsUnc['!cols'] = [
        { wch: 5 },
        { wch: 40 },
        { wch: 16 },
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
    ]
    XLSX.utils.book_append_sheet(workbook, wsUnc, 'Belum Berkontrak')

    // ── Sheet per sub kegiatan ────────────────────────────────────────────
    const usedNames = new Set<string>(['Rekap Sub Kegiatan', 'Belum Berkontrak'])
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
            [
                'Data progres: status s.d. tanggal akhir periode; baris "Belum berkontrak" = belum punya kontrak',
            ],
            [],
            [
                'No',
                'Nama Paket Pekerjaan',
                'Kode Paket',
                'Status',
                'Rencana (%)',
                'Realisasi (%)',
                'Deviasi (%)',
                ...finShort,
                'PHO',
                'Terakhir Update',
            ],
        ]

        group.items.forEach((item, index) => {
            rows.push([
                index + 1,
                item.namaPaket || '-',
                item.kodePaket || '-',
                item.isUncontracted ? 'Belum berkontrak' : 'Berkontrak',
                item.rencana ?? '-',
                item.realisasi ?? '-',
                item.deviasi ?? '-',
                ...financialNumericCells(fin, {
                    pagu: item.pagu ?? 0,
                    nilaiKontrak: item.nilaiKontrak ?? 0,
                    sisaKontrak: item.sisaKontrak ?? 0,
                    retensi: item.retensi ?? 0,
                }),
                item.isUncontracted ? '-' : phoLabel(item.phoCompleted),
                item.isUncontracted ? '-' : formatUpdatedAt(item.updatedAt),
            ])
        })

        const gRekap = buildSubKegiatanRekap(group.items)[0]
        if (gRekap) {
            rows.push([])
            rows.push([
                '',
                'SUBTOTAL / RATA-RATA',
                '',
                '',
                gRekap.rencana,
                gRekap.realisasi,
                gRekap.deviasi,
                ...financialNumericCells(fin, gRekap),
                `${gRekap.phoSudah} Sudah / ${gRekap.phoBelum} Belum`,
                '',
            ])
        }

        const ws = XLSX.utils.aoa_to_sheet(rows)
        ws['!cols'] = [
            { wch: 5 },
            { wch: 40 },
            { wch: 16 },
            { wch: 16 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            ...finColWidth,
            { wch: 10 },
            { wch: 20 },
        ]
        XLSX.utils.book_append_sheet(workbook, ws, sheetName)
    })

    const defaultName = `progress-fisik-${tahun}-${options.period.startDate}_${options.period.endDate}.xlsx`
    XLSX.writeFile(workbook, fileName || defaultName)
}
