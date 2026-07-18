import type { PengawasKpiItem } from '../api/pengawas-kpi'
import { formatPengawasKpiRoles } from './pengawas-kpi-peran'
import { getScorePerPekerjaan } from './pengawas-kpi-utils'

function escapeCsv(value: string | number | null | undefined): string {
    const text = value == null ? '' : String(value)
    if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`
    }
    return text
}

export function exportPengawasKpiCsv(items: PengawasKpiItem[], tahun: number) {
    const headers = [
        'Peringkat',
        'Nama Pengawas',
        'NIP',
        'Peran',
        'Jumlah Pekerjaan',
        'Dokumentasi Foto',
        'Penerima Manfaat',
        'Output',
        'Baris Progress',
        'Rata-rata Kelengkapan 0-100',
        'Sigma Skor Paket',
        'Paket Berkualitas (>=70)',
    ]

    const rows = items.map((item) => [
        item.rank,
        item.nama,
        item.nip ?? '',
        formatPengawasKpiRoles(item.roles),
        item.pekerjaan_count,
        item.foto_count,
        item.penerima_count,
        item.output_count,
        item.fisik_count,
        getScorePerPekerjaan(item),
        item.score,
        item.quality_packages ?? '',
    ])

    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `peringkat-kelengkapan-pengawas-${tahun}.csv`
    link.click()
    URL.revokeObjectURL(url)
}