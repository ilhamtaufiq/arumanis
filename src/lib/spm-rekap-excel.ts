import {
    aggregateByKecamatan,
    buildDesaRows,
    buildYearMatrix,
    sortWilayahRows,
    summarizeRows,
    type SpmProjection,
    type SpmRekapDesaInput,
    type SpmRekapWilayahRow,
    type SpmYearlyRow,
} from './spm-rekap'

type Cell = string | number | null
export type RekapSheet = { name: string; rows: Cell[][]; widths?: number[] }

export type RekapExcelInput = {
    title: string
    scopeLabel: string
    capaianLabel: string
    showSr?: boolean
    showBjp?: boolean
    desaInputs: SpmRekapDesaInput[]
    yearlyRows: SpmYearlyRow[]
    yearlyBaseline?: number
    yearlyBaselineLabel?: string
    projection?: SpmProjection | null
    matrix?: { years: readonly string[]; byYear: readonly (SpmRekapDesaInput[] | undefined)[] }
    generatedAt?: Date
}

const round2 = (value: number | null | undefined) =>
    value == null || !Number.isFinite(value) ? null : Math.round(value * 100) / 100

function wilayahSheet(
    name: string,
    rows: SpmRekapWilayahRow[],
    mode: 'kecamatan' | 'desa',
    input: RekapExcelInput,
): RekapSheet {
    const header: Cell[] = [
        'No',
        ...(mode === 'desa' ? ['Kecamatan', 'Desa'] : ['Kecamatan', 'Jumlah Desa', 'Desa Tuntas', 'Desa Belum Ada Capaian']),
        'Target KK',
        input.capaianLabel,
        ...(input.showSr ? ['SR'] : []),
        ...(input.showBjp ? ['Dari BJP (KK)'] : []),
        'Jiwa',
        'Gap KK',
        'Cakupan (%)',
        'Unit',
    ]
    const sorted = sortWilayahRows(rows, 'nama', 'asc')
    const body: Cell[][] = sorted.map((row, index) => [
        index + 1,
        ...(mode === 'desa'
            ? [row.kecamatan, row.nama]
            : [row.nama, row.desaCount, row.desaTuntas, row.desaTanpaCapaian]),
        row.target,
        row.capaian,
        ...(input.showSr ? [row.sr] : []),
        ...(input.showBjp ? [row.bjp] : []),
        row.jiwa,
        row.gap,
        round2(row.coverage),
        row.unit,
    ])
    const total = summarizeRows(rows)
    const footer: Cell[] = [
        null,
        ...(mode === 'desa' ? ['TOTAL', null] : ['TOTAL', total.desaCount, total.desaTuntas, total.desaTanpaCapaian]),
        total.target,
        total.capaian,
        ...(input.showSr ? [total.sr] : []),
        ...(input.showBjp ? [total.bjp] : []),
        total.jiwa,
        total.gap,
        round2(total.coverage),
        total.unit,
    ]
    return {
        name,
        rows: [header, ...body, footer],
        widths: header.map((_, i) => (i === 0 ? 5 : i <= (mode === 'desa' ? 2 : 1) ? 22 : 14)),
    }
}

/** Susun isi sheet rekap capaian (murni, tanpa dependensi xlsx). */
export function buildRekapSheets(input: RekapExcelInput): RekapSheet[] {
    const desaRows = buildDesaRows(input.desaInputs)
    const kecRows = aggregateByKecamatan(input.desaInputs)
    const total = summarizeRows(desaRows)
    const generatedAt = input.generatedAt ?? new Date()
    const p = input.projection

    const ringkasan: Cell[][] = [
        [input.title],
        ['Cakupan data', input.scopeLabel],
        ['Dibuat', generatedAt.toLocaleString('id-ID')],
        [],
        ['Indikator', 'Nilai'],
        ['Jumlah kecamatan', kecRows.length],
        ['Jumlah desa', desaRows.length],
        ['Target KK', total.target],
        [input.capaianLabel, total.capaian],
        ['Gap KK', total.gap],
        ['Cakupan (%)', round2(total.coverage)],
        ['Desa tuntas (≥ 100%)', total.desaTuntas],
        ['Desa belum ada capaian', total.desaTanpaCapaian],
    ]
    if (p) {
        ringkasan.push(
            [],
            ['Target vs Realisasi', null],
            ['Target cakupan (%)', p.targetPercent],
            ['Tahun target', p.targetYear],
            [`Realisasi kumulatif s/d ${p.lastYear} (KK)`, Math.round(p.current)],
            ['Cakupan realisasi (%)', round2(p.currentCoverage)],
            ['Sisa menuju target (KK)', Math.round(p.remaining)],
            ['Kebutuhan per tahun (KK)', Math.round(p.requiredPerYear)],
            [`Laju rata-rata ${p.averageYears} tahun terakhir (KK)`, Math.round(p.averagePerYear)],
            ['Perkiraan target tercapai', p.estimatedYear ?? '-'],
            ['Status', p.onTrack ? 'Sesuai jalur' : 'Perlu percepatan'],
        )
    }

    const yearlyHeader: Cell[] = [
        'Tahun',
        `Tambahan ${input.capaianLabel}`,
        ...(input.showSr ? ['Tambahan SR'] : []),
        'Jiwa',
        'Selisih vs tahun lalu',
        'Selisih vs tahun lalu (%)',
        'Kenaikan cakupan (poin %)',
        'Kumulatif',
        'Cakupan kumulatif (%)',
    ]
    const yearlyBody: Cell[][] = []
    if ((input.yearlyBaseline ?? 0) > 0) {
        yearlyBody.push([
            input.yearlyBaselineLabel ?? 'Sebelumnya / tanpa tahun',
            input.yearlyBaseline ?? 0,
            ...(input.showSr ? [null] : []),
            null,
            null,
            null,
            null,
            input.yearlyBaseline ?? 0,
            null,
        ])
    }
    for (const row of input.yearlyRows) {
        yearlyBody.push([
            row.tahun,
            row.capaian,
            ...(input.showSr ? [row.sr] : []),
            row.jiwa,
            row.delta,
            round2(row.deltaPct),
            round2(row.coverageGain),
            row.kumulatif,
            round2(row.coverageKumulatif),
        ])
    }

    const sheets: RekapSheet[] = [
        { name: 'Ringkasan', rows: ringkasan, widths: [38, 24] },
        { name: 'Per Tahun', rows: [yearlyHeader, ...yearlyBody], widths: yearlyHeader.map(() => 18) },
        wilayahSheet('Per Kecamatan', kecRows, 'kecamatan', input),
        wilayahSheet('Per Desa', desaRows, 'desa', input),
    ]

    const matrix = input.matrix
    if (matrix && matrix.byYear.some(Boolean)) {
        for (const mode of ['kecamatan', 'desa'] as const) {
            const rows = buildYearMatrix(matrix.years, matrix.byYear, mode).sort((a, b) =>
                a.kecamatan.localeCompare(b.kecamatan, 'id') || a.nama.localeCompare(b.nama, 'id'),
            )
            const header: Cell[] = [
                ...(mode === 'desa' ? ['Kecamatan', 'Desa'] : ['Kecamatan']),
                ...matrix.years,
                'Total',
            ]
            sheets.push({
                name: mode === 'desa' ? 'Matriks Desa' : 'Matriks Kecamatan',
                rows: [
                    header,
                    ...rows.map((row) => [
                        ...(mode === 'desa' ? [row.kecamatan, row.nama] : [row.nama]),
                        ...matrix.years.map((year) => row.values[year] ?? 0),
                        row.total,
                    ]),
                ],
                widths: header.map((_, i) => (i < (mode === 'desa' ? 2 : 1) ? 22 : 10)),
            })
        }
    }

    return sheets
}

/** Unduh rekap sebagai .xlsx (library xlsx dimuat saat dibutuhkan). */
export async function exportRekapExcel(input: RekapExcelInput, filename: string) {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    for (const sheet of buildRekapSheets(input)) {
        const ws = XLSX.utils.aoa_to_sheet(sheet.rows)
        if (sheet.widths) ws['!cols'] = sheet.widths.map((wch) => ({ wch }))
        XLSX.utils.book_append_sheet(wb, ws, sheet.name)
    }
    XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}
