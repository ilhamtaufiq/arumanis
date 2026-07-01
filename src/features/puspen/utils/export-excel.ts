import * as XLSX from 'xlsx'
import type { PuspenProgressFisikItem } from '../api/progress-fisik'

type ExportExcelParams = {
    items: PuspenProgressFisikItem[]
    tahun: number
    fileName?: string
}

export function exportProgressFisikExcel({ items, tahun, fileName }: ExportExcelParams) {
    if (!items.length) return

    const workbook = XLSX.utils.book_new()

    // ============ Sheet 1: Data ============
    const dataRows: unknown[][] = [
        ['Estimasi Progress Fisik - Tahun ' + tahun],
        [],
        ['No', 'Nama Paket Pekerjaan', 'Kode Paket', 'Sub Kegiatan', 'Rencana (%)', 'Realisasi (%)', 'Deviasi (%)', 'Terakhir Update'],
    ]

    items.forEach((item, index) => {
        const deviasi = item.rencana !== null && item.realisasi !== null
            ? Number((item.realisasi - item.rencana).toFixed(2))
            : null

        const updatedAt = item.updatedAt
            ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.updatedAt))
            : '-'

        dataRows.push([
            index + 1,
            item.namaPaket || '-',
            item.kodePaket || '-',
            item.subKegiatan || '-',
            item.rencana ?? '-',
            item.realisasi ?? '-',
            deviasi ?? '-',
            updatedAt,
        ])
    })

    // Averages
    const avgRencana = items.reduce((sum, item) => sum + (item.rencana ?? 0), 0) / items.length
    const avgRealisasi = items.reduce((sum, item) => sum + (item.realisasi ?? 0), 0) / items.length
    dataRows.push([])
    dataRows.push(['Rata-rata Rencana', '', '', '', Number(avgRencana.toFixed(2))])
    dataRows.push(['Rata-rata Realisasi', '', '', '', '', Number(avgRealisasi.toFixed(2))])

    const ws1 = XLSX.utils.aoa_to_sheet(dataRows)
    ws1['!cols'] = [
        { wch: 5 },
        { wch: 50 },
        { wch: 25 },
        { wch: 35 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 22 },
    ]
    XLSX.utils.book_append_sheet(workbook, ws1, 'Progress Fisik')

    // ============ Sheet 2: Per Sub Kegiatan ============
    const subKegiatanMap = new Map<string, { count: number; rencana: number; realisasi: number }>()
    items.forEach((item) => {
        const key = item.subKegiatan || 'Tanpa Sub Kegiatan'
        const existing = subKegiatanMap.get(key) || { count: 0, rencana: 0, realisasi: 0 }
        existing.count++
        existing.rencana += item.rencana ?? 0
        existing.realisasi += item.realisasi ?? 0
        subKegiatanMap.set(key, existing)
    })

    const subRows: unknown[][] = [
        ['Rekapitulasi Per Sub Kegiatan'],
        [],
        ['Sub Kegiatan', 'Jumlah Paket', 'Rata-rata Rencana (%)', 'Rata-rata Realisasi (%)', 'Rata-rata Deviasi (%)'],
    ]

    subKegiatanMap.forEach((val, key) => {
        const avgRen = val.rencana / val.count
        const avgReal = val.realisasi / val.count
        const avgDev = avgReal - avgRen
        subRows.push([key, val.count, Number(avgRen.toFixed(2)), Number(avgReal.toFixed(2)), Number(avgDev.toFixed(2))])
    })

    const ws2 = XLSX.utils.aoa_to_sheet(subRows)
    ws2['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 22 }, { wch: 25 }, { wch: 22 }]
    XLSX.utils.book_append_sheet(workbook, ws2, 'Per Sub Kegiatan')

    const defaultName = `progress-fisik-${tahun}.xlsx`
    XLSX.writeFile(workbook, fileName || defaultName)
}
