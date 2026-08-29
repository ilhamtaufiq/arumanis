import type { Pekerjaan } from '../types'

export type ExportColumnId =
    | 'no'
    | 'kode_rekening'
    | 'nama_paket'
    | 'sub_kegiatan'
    | 'kecamatan'
    | 'desa'
    | 'pagu'
    | 'nilai_kontrak'
    | 'nomor_spk'
    | 'tgl_spk'
    | 'tgl_spmk'
    | 'tgl_selesai'
    | 'nomor_sp2d'
    | 'tgl_sp2d'
    | 'nilai_sp2d'
    | 'sisa_kontrak'
    | 'pengawas'
    | 'pendamping'
    | 'tags'
    | 'status'
    | 'catatan'
    | 'progress_fisik'
    | 'progress_keuangan'
    | 'deviasi'
    | 'is_konsultan'
    | 'output_komponen'
    | 'output_volume'
    | 'output_satuan'

/** Label status paket untuk export (API: active | canceled). */
export function formatPekerjaanStatus(status: string | null | undefined): string {
    if (status === 'canceled') return 'Dibatalkan'
    if (status === 'active' || !status) return 'Aktif'
    return String(status)
}

/** True jika paket punya minimal 1 kontrak (flag API atau relasi/count). */
export function pekerjaanHasKontrak(item: Pekerjaan): boolean {
    if (item.has_kontrak != null) return Boolean(item.has_kontrak)
    if ((item.kontrak_count ?? 0) > 0) return true
    return (item.kontrak?.length ?? 0) > 0
}

/** True jika status paket dibatalkan. */
export function pekerjaanIsCanceled(item: Pekerjaan): boolean {
    return item.status === 'canceled'
}

/**
 * Jumlah nilai kontrak (semua kontrak pada paket).
 * `null` jika tidak ada data kontrak di payload (bukan 0).
 */
export function sumNilaiKontrak(item: Pekerjaan): number | null {
    const rows = item.kontrak
    if (!rows?.length) {
        // has_kontrak tapi array tidak diload → tidak bisa hitung
        if (pekerjaanHasKontrak(item)) return null
        return null
    }
    return rows.reduce((sum, k) => sum + (Number(k.nilai_kontrak) || 0), 0)
}

/**
 * Jumlah nilai kontrak unik (dedup by kontrak.id) dalam satu group.
 * Menghindari double-count kontrak konsolidasi yang di-share antar paket.
 */
export function sumNilaiKontrakUnique(items: Pekerjaan[]): number {
    const seen = new Set<number>()
    let total = 0
    for (const item of items) {
        const kontrakList = item.kontrak
        if (!kontrakList?.length) continue
        for (const k of kontrakList) {
            if (k.id == null || seen.has(k.id)) continue
            seen.add(k.id)
            total += Number(k.nilai_kontrak) || 0
        }
    }
    return total
}

/**
 * Total SP2D unik (dedup by register/SP2D id) dalam satu group.
 */
export function sumSp2dUnique(items: Pekerjaan[]): number {
    const seen = new Set<number>()
    let total = 0
    for (const item of items) {
        const kontrakList = item.kontrak
        if (!kontrakList?.length) continue
        for (const k of kontrakList) {
            const registers = (k as any).registers ?? []
            for (const r of registers) {
                if (r.type?.code !== 'sp2d' && r.type?.code !== 'SP2D') continue
                if (r.id == null || seen.has(r.id)) continue
                seen.add(r.id)
                total += Number(r.nilai) || 0
            }
        }
    }
    return total
}

export type ExportColumnDef = {
    id: ExportColumnId
    label: string
    /** Excel / PDF header */
    header: string
    /** Default selected in export dialog */
    defaultSelected: boolean
    /** Approximate Excel column width (chars) */
    excelWidth: number
    /** Approximate PDF column width (mm); ignored for auto layout */
    pdfWidth?: number
    getValue: (item: Pekerjaan, index: number) => string | number
}

function formatRp(value: number | null | undefined): string {
    if (value == null || Number.isNaN(Number(value))) return '-'
    return `Rp ${Number(value).toLocaleString('id-ID')}`
}

function formatPercent(value: number | null | undefined): string {
    if (value == null || Number.isNaN(Number(value))) return '-'
    return `${Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`
}

/** All columns available for pekerjaan export (PDF / Excel). */
export const PEKERJAAN_EXPORT_COLUMNS: ExportColumnDef[] = [
    {
        id: 'no',
        label: 'No',
        header: 'No',
        defaultSelected: true,
        excelWidth: 5,
        pdfWidth: 10,
        getValue: (_item, index) => index + 1,
    },
    {
        id: 'kode_rekening',
        label: 'Kode Rekening',
        header: 'Kode Rekening',
        defaultSelected: true,
        excelWidth: 20,
        pdfWidth: 28,
        getValue: (item) => item.kode_rekening || '-',
    },
    {
        id: 'nama_paket',
        label: 'Nama Paket',
        header: 'Nama Paket',
        defaultSelected: true,
        excelWidth: 50,
        pdfWidth: 50,
        getValue: (item) => item.nama_paket || '-',
    },
    {
        id: 'sub_kegiatan',
        label: 'Sub Kegiatan',
        header: 'Sub Kegiatan',
        defaultSelected: true,
        excelWidth: 40,
        pdfWidth: 40,
        getValue: (item) => item.kegiatan?.nama_sub_kegiatan || '-',
    },
    {
        id: 'kecamatan',
        label: 'Kecamatan',
        header: 'Kecamatan',
        defaultSelected: true,
        excelWidth: 20,
        pdfWidth: 28,
        getValue: (item) => item.kecamatan?.nama_kecamatan || '-',
    },
    {
        id: 'desa',
        label: 'Desa',
        header: 'Desa',
        defaultSelected: true,
        excelWidth: 20,
        pdfWidth: 28,
        getValue: (item) => item.desa?.nama_desa || '-',
    },
    {
        id: 'pagu',
        label: 'Pagu',
        header: 'Pagu',
        defaultSelected: true,
        excelWidth: 18,
        pdfWidth: 32,
        getValue: (item) => item.pagu ?? 0,
    },
    {
        id: 'nilai_kontrak',
        label: 'Nilai Kontrak',
        header: 'Nilai Kontrak',
        defaultSelected: false,
        excelWidth: 18,
        pdfWidth: 32,
        getValue: (item) => {
            const total = sumNilaiKontrak(item)
            return total == null ? '-' : total
        },
    },
    {
        id: 'nomor_spk',
        label: 'Nomor SPK',
        header: 'Nomor SPK',
        defaultSelected: false,
        excelWidth: 22,
        pdfWidth: 30,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            return kontrakList.map((k) => k.spk || '-').join(', ')
        },
    },
    {
        id: 'tgl_spk',
        label: 'Tanggal SPK',
        header: 'Tanggal SPK',
        defaultSelected: false,
        excelWidth: 16,
        pdfWidth: 22,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            return kontrakList.map((k) => k.tgl_spk || '-').join(', ')
        },
    },
    {
        id: 'tgl_spmk',
        label: 'Mulai Pekerjaan',
        header: 'Mulai Pekerjaan',
        defaultSelected: false,
        excelWidth: 16,
        pdfWidth: 22,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            return kontrakList.map((k) => k.tgl_spmk || '-').join(', ')
        },
    },
    {
        id: 'tgl_selesai',
        label: 'Selesai Pekerjaan',
        header: 'Selesai Pekerjaan',
        defaultSelected: false,
        excelWidth: 16,
        pdfWidth: 22,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            return kontrakList.map((k) => k.tgl_selesai || '-').join(', ')
        },
    },
    {
        id: 'nomor_sp2d',
        label: 'Nomor SP2D',
        header: 'Nomor SP2D',
        defaultSelected: false,
        excelWidth: 22,
        pdfWidth: 30,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            const sp2dNomor = kontrakList
                .flatMap((k) => (k as any).registers ?? [])
                .filter((r: any) => r.type?.code === 'sp2d' || r.type?.code === 'SP2D')
                .map((r: any) => r.nomor)
                .filter(Boolean)
            return sp2dNomor.length > 0 ? sp2dNomor.join(', ') : '-'
        },
    },
    {
        id: 'tgl_sp2d',
        label: 'Tanggal SP2D',
        header: 'Tanggal SP2D',
        defaultSelected: false,
        excelWidth: 16,
        pdfWidth: 22,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            const sp2dTgl = kontrakList
                .flatMap((k) => (k as any).registers ?? [])
                .filter((r: any) => r.type?.code === 'sp2d' || r.type?.code === 'SP2D')
                .map((r: any) => r.tanggal)
                .filter(Boolean)
            return sp2dTgl.length > 0 ? sp2dTgl.join(', ') : '-'
        },
    },
    {
        id: 'nilai_sp2d',
        label: 'Nilai SP2D',
        header: 'Nilai SP2D',
        defaultSelected: false,
        excelWidth: 18,
        pdfWidth: 28,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            const sp2dNilai = kontrakList
                .flatMap((k) => (k as any).registers ?? [])
                .filter((r: any) => r.type?.code === 'sp2d' || r.type?.code === 'SP2D')
                .map((r: any) => r.nilai)
                .filter((v: any) => v != null)
            if (sp2dNilai.length === 0) return '-'
            return sp2dNilai.reduce((a: number, b: number) => a + Number(b), 0)
        },
    },
    {
        id: 'sisa_kontrak',
        label: 'Sisa Kontrak',
        header: 'Sisa Kontrak',
        defaultSelected: false,
        excelWidth: 18,
        pdfWidth: 28,
        getValue: (item) => {
            const kontrakList = item.kontrak
            if (!kontrakList?.length) return '-'
            const totalKontrak = kontrakList.reduce((sum, k) => sum + (Number(k.nilai_kontrak) || 0), 0)
            const totalSp2d = kontrakList
                .flatMap((k) => (k as any).registers ?? [])
                .filter((r: any) => r.type?.code === 'sp2d' || r.type?.code === 'SP2D')
                .reduce((sum: number, r: any) => sum + (Number(r.nilai) || 0), 0)
            if (totalSp2d === 0) return '-'
            return totalKontrak - totalSp2d
        },
    },
    {
        label: 'Pengawas',
        header: 'Pengawas',
        defaultSelected: true,
        excelWidth: 25,
        pdfWidth: 30,
        getValue: (item) => item.pengawas?.nama || '-',
    },
    {
        id: 'pendamping',
        label: 'Pendamping',
        header: 'Pendamping',
        defaultSelected: true,
        excelWidth: 25,
        pdfWidth: 30,
        getValue: (item) => item.pendamping?.nama || '-',
    },
    {
        id: 'tags',
        label: 'Tags',
        header: 'Tags',
        defaultSelected: true,
        excelWidth: 30,
        pdfWidth: 24,
        getValue: (item) => item.tags?.map((t) => t.name).join(', ') || '-',
    },
    {
        id: 'status',
        label: 'Status Paket',
        header: 'Status',
        defaultSelected: true,
        excelWidth: 14,
        pdfWidth: 22,
        getValue: (item) => formatPekerjaanStatus(item.status),
    },
    {
        id: 'catatan',
        label: 'Catatan',
        header: 'Catatan',
        defaultSelected: true,
        excelWidth: 40,
        pdfWidth: 36,
        getValue: (item) => {
            const text = item.catatan?.trim()
            return text ? text : '-'
        },
    },
    {
        id: 'progress_fisik',
        label: 'Progress Fisik',
        header: 'Progress Fisik',
        defaultSelected: true,
        excelWidth: 14,
        pdfWidth: 22,
        // Sumber: detail pekerjaan → tab Progress (PekerjaanProgressEstimasiTab)
        // = realisasi terakhir progress estimasi fisik
        getValue: (item) =>
            item.progress_estimasi_fisik != null
                ? formatPercent(item.progress_estimasi_fisik)
                : '-',
    },
    {
        id: 'progress_keuangan',
        label: 'Progress Keuangan',
        header: 'Progress Keuangan',
        defaultSelected: true,
        excelWidth: 16,
        pdfWidth: 24,
        // Sumber: tab Progress → Keuangan (termasuk sinkron SP2D)
        getValue: (item) => {
            const pct = item.progress_estimasi_keuangan != null
                ? formatPercent(item.progress_estimasi_keuangan)
                : '-'
            const nilai = item.progress_estimasi_keuangan_nilai != null && item.progress_estimasi_keuangan_nilai > 0
                ? ` (${formatRp(item.progress_estimasi_keuangan_nilai)})`
                : ''
            return `${pct}${nilai}`
        },
    },
    {
        id: 'deviasi',
        label: 'Deviasi',
        header: 'Deviasi',
        defaultSelected: false,
        excelWidth: 12,
        pdfWidth: 18,
        // Deviasi estimasi fisik (realisasi − rencana) di tab Progress detail pekerjaan
        getValue: (item) =>
            item.deviasi_estimasi_fisik != null
                ? formatPercent(item.deviasi_estimasi_fisik)
                : '-',
    },
    {
        id: 'is_konsultan',
        label: 'Jenis (Konsultan)',
        header: 'Jenis',
        defaultSelected: false,
        excelWidth: 14,
        pdfWidth: 22,
        getValue: (item) => (item.is_konsultan ? 'Konsultan' : 'Fisik'),
    },
    {
        id: 'output_komponen',
        label: 'Output — Komponen',
        header: 'Output — Komponen',
        defaultSelected: false,
        excelWidth: 50,
        pdfWidth: 50,
        getValue: (item) => {
            const comps = item.output?.map((o) => o.komponen).filter(Boolean)
            return comps?.length ? comps.join(' | ') : '-'
        },
    },
    {
        id: 'output_volume',
        label: 'Output — Volume',
        header: 'Output — Volume',
        defaultSelected: false,
        excelWidth: 14,
        pdfWidth: 22,
        getValue: (item) => {
            const vols = item.output?.map((o) => o.volume).filter((v) => v != null)
            return vols?.length ? vols.join(' | ') : '-'
        },
    },
    {
        id: 'output_satuan',
        label: 'Output — Satuan',
        header: 'Output — Satuan',
        defaultSelected: false,
        excelWidth: 20,
        pdfWidth: 24,
        getValue: (item) => {
            const units = item.output?.map((o) => o.satuan).filter(Boolean)
            return units?.length ? units.join(' | ') : '-'
        },
    },
]

export const DEFAULT_EXPORT_COLUMN_IDS: ExportColumnId[] = PEKERJAAN_EXPORT_COLUMNS
    .filter((c) => c.defaultSelected)
    .map((c) => c.id)

/** Bump version when default columns change so UI picks up new defaults. */
export const EXPORT_COLUMNS_STORAGE_KEY = 'pekerjaan-export-columns-v4'

export function getExportColumnsByIds(ids: ExportColumnId[]): ExportColumnDef[] {
    const set = new Set(ids)
    // Preserve catalog order
    return PEKERJAAN_EXPORT_COLUMNS.filter((c) => set.has(c.id))
}

export function formatPaguForDisplay(value: string | number): string {
    if (typeof value === 'number') return formatRp(value)
    return String(value)
}

/** Build row objects for Excel (header keys = column headers). */
export function buildExcelRows(
    data: Pekerjaan[],
    columns: ExportColumnDef[],
): Record<string, string | number>[] {
    return data.map((item, index) => {
        const row: Record<string, string | number> = {}
        for (const col of columns) {
            row[col.header] = col.getValue(item, index)
        }
        return row
    })
}

const RUPIAH_COLUMNS = new Set<ExportColumnId>([
    'pagu', 'nilai_kontrak', 'nilai_sp2d', 'sisa_kontrak',
])

const CENTER_COLUMNS = new Set<ExportColumnId>([
    'no', 'status', 'is_konsultan',
])

const PERCENT_COLUMNS = new Set<ExportColumnId>([
    'progress_fisik', 'progress_keuangan', 'deviasi',
])

/**
 * Build a styled Excel workbook using exceljs.
 * Header: blue bg, white bold text, centered. Alternating row colors. Borders. Rupiah formatting.
 */
export async function buildStyledExcelWorkbook(
    data: Pekerjaan[],
    columns: ExportColumnDef[],
    groups: SubKegiatanGroup[],
    groupBySubKegiatan: boolean,
    opts: {
        noKontrakItems: Pekerjaan[]
        canceledItems: Pekerjaan[]
        dateStamp: string
    },
): Promise<Blob> {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const usedNames = new Set<string>()

    const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    const ALT_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
    const BORDER: Partial<ExcelJS.Borders> = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    }

    function addStyledSheet(items: Pekerjaan[], name: string) {
        const sheet = workbook.addWorksheet(name.slice(0, 31))
        const headers = columns.map((c) => c.header)

        // Header row
        const headerRow = sheet.addRow(headers)
        headerRow.eachCell((cell) => {
            cell.fill = HEADER_FILL
            cell.font = HEADER_FONT
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
            cell.border = BORDER as any
        })
        headerRow.height = 24

        // Data rows
        items.forEach((item, index) => {
            const values = columns.map((col) => {
                const val = col.getValue(item, index)
                if (RUPIAH_COLUMNS.has(col.id) && typeof val === 'number') return val
                return val
            })
            const row = sheet.addRow(values)
            row.eachCell((cell, colNum) => {
                const col = columns[colNum - 1]
                cell.border = BORDER as any
                cell.font = { size: 9 }

                // Alignment
                if (CENTER_COLUMNS.has(col.id)) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' }
                } else if (RUPIAH_COLUMNS.has(col.id)) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' }
                    cell.numFmt = '#,##0'
                } else if (PERCENT_COLUMNS.has(col.id)) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' }
                } else {
                    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
                }

                // Alternating row color
                if (index % 2 === 1) {
                    cell.fill = ALT_FILL
                }
            })
        })

        // Column widths
        columns.forEach((col, i) => {
            const colObj = sheet.getColumn(i + 1)
            colObj.width = col.excelWidth
        })

        // Auto filter
        if (items.length > 0) {
            sheet.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: items.length + 1, column: columns.length },
            }
        }
    }

    // Ringkasan sheet
    if (groupBySubKegiatan && groups.length > 1) {
        const sheet = workbook.addWorksheet('Ringkasan')
        const summaryHeaders = ['No', 'Sub Kegiatan', 'Total Paket', 'Aktif', 'Belum Berkontrak', 'Batal', 'Total Pagu', 'Total Nilai Kontrak', 'Total Realisasi', 'Total Sisa Kontrak']
        const headerRow = sheet.addRow(summaryHeaders)
        headerRow.eachCell((cell) => {
            cell.fill = HEADER_FILL
            cell.font = HEADER_FONT
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
            cell.border = BORDER as any
        })
        headerRow.height = 24

        groups.forEach((g, i) => {
            const totalPagu = g.items.reduce((sum, row) => sum + (Number(row.pagu) || 0), 0)
            const totalNilaiKontrak = sumNilaiKontrakUnique(g.items)
            const totalRealisasi = g.items.reduce((sum, row) =>
                sum + (row.progress_estimasi_keuangan_nilai ?? 0), 0)
            const totalSisaKontrak = totalNilaiKontrak - totalRealisasi
            const total = g.items.length
            const canceled = g.items.filter((item) => pekerjaanIsCanceled(item)).length
            const noKontrak = g.items.filter((item) => !pekerjaanHasKontrak(item)).length
            const aktif = total - canceled

            const row = sheet.addRow([
                i + 1, g.label, total, aktif, noKontrak, canceled,
                totalPagu, totalNilaiKontrak, Math.round(totalRealisasi), Math.round(totalSisaKontrak),
            ])
            row.eachCell((cell, colNum) => {
                cell.border = BORDER as any
                cell.font = { size: 9 }
                if (colNum === 1 || (colNum >= 3 && colNum <= 6)) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' }
                } else if (colNum >= 7) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' }
                    cell.numFmt = '#,##0'
                }
                if (i % 2 === 1) cell.fill = ALT_FILL
            })
        })

        sheet.getColumn(1).width = 5
        sheet.getColumn(2).width = 50
        for (let c = 3; c <= 6; c++) sheet.getColumn(c).width = 14
        for (let c = 7; c <= 10; c++) sheet.getColumn(c).width = 22
    }

    // Belum Berkontrak
    if (opts.noKontrakItems.length > 0) {
        addStyledSheet(opts.noKontrakItems, 'Belum Berkontrak')
    }

    // Dibatalkan
    if (opts.canceledItems.length > 0) {
        addStyledSheet(opts.canceledItems, 'Dibatalkan')
    }

    // Detail per sub kegiatan
    if (groupBySubKegiatan) {
        groups.forEach((group, index) => {
            const name = sanitizeExcelSheetName(group.label, usedNames, index + 1)
            addStyledSheet(group.items, name)
        })
    } else {
        addStyledSheet(data, 'Pekerjaan')
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/** Head + body arrays for jsPDF autoTable. */
export function buildPdfTable(
    data: Pekerjaan[],
    columns: ExportColumnDef[],
): { head: string[][]; body: string[][] } {
    const head = [columns.map((c) => c.header)]
    const body = data.map((item, index) =>
        columns.map((col) => {
            const value = col.getValue(item, index)
            if (
                (col.id === 'pagu' || col.id === 'nilai_kontrak') &&
                typeof value === 'number'
            ) {
                return formatRp(value)
            }
            return String(value ?? '-')
        }),
    )
    return { head, body }
}

export type SubKegiatanGroup = {
    key: string
    kegiatanId: number | null
    label: string
    items: Pekerjaan[]
}

/** Group pekerjaan by sub kegiatan (stable sort by label). */
export function groupPekerjaanBySubKegiatan(data: Pekerjaan[]): SubKegiatanGroup[] {
    const map = new Map<string, SubKegiatanGroup>()

    for (const item of data) {
        const kegiatanId = item.kegiatan_id ?? item.kegiatan?.id ?? null
        const label =
            item.kegiatan?.nama_sub_kegiatan?.trim() ||
            (kegiatanId != null ? `Sub kegiatan #${kegiatanId}` : 'Tanpa sub kegiatan')
        const key = kegiatanId != null ? `id:${kegiatanId}` : `label:${label}`

        const existing = map.get(key)
        if (existing) {
            existing.items.push(item)
        } else {
            map.set(key, { key, kegiatanId, label, items: [item] })
        }
    }

    return Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label, 'id', { sensitivity: 'base' }),
    )
}

/**
 * Merge paket konsolidasi: paket yang share kontrak_id yang sama digabung jadi 1 baris.
 * Paket tanpa kontrak atau kontrak yang tidak di-share tetap apa adanya.
 */
export function mergeKonsolidasiPekerjaan(data: Pekerjaan[]): Pekerjaan[] {
    const kontrakToIndexes = new Map<number, number[]>()
    for (let i = 0; i < data.length; i++) {
        const kontrakList = data[i].kontrak
        if (!kontrakList?.length) continue
        for (const k of kontrakList) {
            if (k.id == null) continue
            const arr = kontrakToIndexes.get(k.id)
            if (arr) {
                if (!arr.includes(i)) arr.push(i)
            } else {
                kontrakToIndexes.set(k.id, [i])
            }
        }
    }

    // Union-find: paket yang terhubung via kontrak yang sama
    const parent = data.map((_, i) => i)
    function find(x: number): number {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]]
            x = parent[x]
        }
        return x
    }
    function union(a: number, b: number) {
        const ra = find(a)
        const rb = find(b)
        if (ra !== rb) parent[rb] = ra
    }

    for (const indexes of kontrakToIndexes.values()) {
        if (indexes.length < 2) continue
        for (let j = 1; j < indexes.length; j++) {
            union(indexes[0], indexes[j])
        }
    }

    const groups = new Map<number, number[]>()
    for (let i = 0; i < data.length; i++) {
        const root = find(i)
        const arr = groups.get(root)
        if (arr) arr.push(i)
        else groups.set(root, [i])
    }

    const result: Pekerjaan[] = []
    for (const indexes of groups.values()) {
        if (indexes.length === 1) {
            result.push(data[indexes[0]])
            continue
        }

        const items = indexes.map((i) => data[i])
        const first = items[0]

        const namaGabung = items.map((p) => p.nama_paket).join(' + ')

        const kodeSet = new Set(items.map((p) => p.kode_rekening).filter(Boolean))
        const kodeGabung = kodeSet.size > 0 ? [...kodeSet].join(', ') : null

        const paguTotal = items.reduce((sum, p) => sum + (Number(p.pagu) || 0), 0)

        const unique = <T extends { id: number }>(arr: (T | undefined | null)[]): T[] =>
            arr
                .filter((x): x is T => x != null)
                .filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i)

        const kecamatanUnique = unique(items.map((p) => p.kecamatan))
        const desaUnique = unique(items.map((p) => p.desa))
        const pengawasUnique = unique(items.map((p) => p.pengawas))
        const pendampingUnique = unique(items.map((p) => p.pendamping))
        const tagsUnique = unique(items.flatMap((p) => p.tags ?? []))
        const kontrakUnique = unique(items.flatMap((p) => p.kontrak ?? []))

        const catatanParts = items.map((p) => p.catatan?.trim()).filter(Boolean)
        const catatanGabung = catatanParts.length > 0 ? catatanParts.join('; ') : null

        const allOutputs = items.flatMap((p) => p.output ?? []).filter(Boolean)
        // Deduplicate outputs by component name
        const outputMap = new Map<string, { komponen: string; volume: number; satuan: string }>()
        for (const o of allOutputs) {
            const existing = outputMap.get(o.komponen)
            if (existing) {
                existing.volume += o.volume
            } else {
                outputMap.set(o.komponen, { komponen: o.komponen, volume: o.volume, satuan: o.satuan })
            }
        }
        const outputGabung = Array.from(outputMap.values())

        const avg = (vals: number[]) =>
            vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
        const fisikVals = items
            .map((p) => p.progress_estimasi_fisik)
            .filter((v): v is number => v != null)
        const keuanganVals = items
            .map((p) => p.progress_estimasi_keuangan)
            .filter((v): v is number => v != null)
        const deviasiFisikVals = items
            .map((p) => p.deviasi_estimasi_fisik)
            .filter((v): v is number => v != null)

        const statuses = new Set(items.map((p) => p.status ?? 'active'))
        const statusMerged = statuses.size === 1 ? items[0].status : 'active'

        const merged: Pekerjaan = {
            ...first,
            nama_paket: namaGabung,
            kode_rekening: kodeGabung,
            pagu: paguTotal,
            kecamatan: kecamatanUnique.length === 1 ? kecamatanUnique[0] : undefined,
            desa: desaUnique.length === 1 ? desaUnique[0] : undefined,
            pengawas: pengawasUnique.length === 1 ? pengawasUnique[0] : undefined,
            pendamping: pendampingUnique.length === 1 ? pendampingUnique[0] : undefined,
            tags: tagsUnique,
            kontrak: kontrakUnique,
            catatan: catatanGabung,
            progress_estimasi_fisik: avg(fisikVals),
            progress_estimasi_keuangan: avg(keuanganVals),
            deviasi_estimasi_fisik: avg(deviasiFisikVals),
            status: statusMerged,
            is_konsultan: items.some((p) => p.is_konsultan),
            has_kontrak: true,
            output: outputGabung,
        }

        if (kecamatanUnique.length > 1) {
            merged.kecamatan = {
                ...kecamatanUnique[0],
                nama_kecamatan: kecamatanUnique.map((k) => k.nama_kecamatan).join(', '),
            }
        }
        if (desaUnique.length > 1) {
            merged.desa = {
                ...desaUnique[0],
                nama_desa: desaUnique.map((d) => d.nama_desa).join(', '),
            }
        }
        if (pengawasUnique.length > 1) {
            merged.pengawas = {
                ...pengawasUnique[0],
                nama: pengawasUnique.map((p) => p.nama).join(', '),
            }
        }
        if (pendampingUnique.length > 1) {
            merged.pendamping = {
                ...pendampingUnique[0],
                nama: pendampingUnique.map((p) => p.nama).join(', '),
            }
        }

        result.push(merged)
    }

    return result
}

/** Excel sheet name: max 31 chars, no \ / * ? : [ ] */
export function sanitizeExcelSheetName(name: string, used: Set<string>, index: number): string {
    let base = name
        .replace(/[\\/*?:[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 28)
    if (!base) base = `Sub ${index + 1}`

    let candidate = base
    let n = 2
    while (used.has(candidate.toLowerCase())) {
        const suffix = ` (${n})`
        candidate = `${base.slice(0, Math.max(1, 31 - suffix.length))}${suffix}`
        n += 1
    }
    used.add(candidate.toLowerCase())
    return candidate
}
