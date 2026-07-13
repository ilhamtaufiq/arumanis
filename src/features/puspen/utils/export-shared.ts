import type { PuspenProgressFisikItem } from '../api/progress-fisik'

export type ExportPeriod = {
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
}

export type SubKegiatanRekapRow = {
    subKegiatan: string
    count: number
    rencana: number
    realisasi: number
    deviasi: number
    pagu: number
    nilaiKontrak: number
    sisaKontrak: number
    retensi: number
    phoSudah: number
    phoBelum: number
}

export function formatCurrencyId(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export function formatNumberId(value: number | null | undefined, digits = 2): string {
    if (value == null || !Number.isFinite(value)) return '-'
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(value)
}

export function formatDateId(isoDate: string): string {
    const date = new Date(`${isoDate}T00:00:00`)
    if (Number.isNaN(date.getTime())) return isoDate
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date)
}

export function formatUpdatedAt(value: string | null): string {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

export function phoLabel(completed: boolean): 'Sudah' | 'Belum' {
    return completed ? 'Sudah' : 'Belum'
}

export function buildSubKegiatanRekap(items: PuspenProgressFisikItem[]): SubKegiatanRekapRow[] {
    const map = new Map<string, SubKegiatanRekapRow>()

    for (const item of items) {
        const key = item.subKegiatan?.trim() || 'Tanpa Sub Kegiatan'
        const existing = map.get(key) ?? {
            subKegiatan: key,
            count: 0,
            rencana: 0,
            realisasi: 0,
            deviasi: 0,
            pagu: 0,
            nilaiKontrak: 0,
            sisaKontrak: 0,
            retensi: 0,
            phoSudah: 0,
            phoBelum: 0,
        }

        existing.count += 1
        existing.rencana += item.rencana ?? 0
        existing.realisasi += item.realisasi ?? 0
        existing.pagu += item.pagu ?? 0
        existing.nilaiKontrak += item.nilaiKontrak ?? 0
        existing.sisaKontrak += item.sisaKontrak ?? 0
        existing.retensi += item.retensi ?? 0
        if (item.phoCompleted) existing.phoSudah += 1
        else existing.phoBelum += 1

        map.set(key, existing)
    }

    return Array.from(map.values())
        .map((row) => {
            const avgRencana = row.count > 0 ? row.rencana / row.count : 0
            const avgRealisasi = row.count > 0 ? row.realisasi / row.count : 0
            return {
                ...row,
                rencana: Number(avgRencana.toFixed(2)),
                realisasi: Number(avgRealisasi.toFixed(2)),
                deviasi: Number((avgRealisasi - avgRencana).toFixed(2)),
            }
        })
        .sort((a, b) => a.subKegiatan.localeCompare(b.subKegiatan, 'id'))
}

/** Awal minggu (Senin) dan akhir minggu (Minggu) untuk tanggal acuan */
export function weekRange(anchor = new Date()): { start: string; end: string } {
    const d = new Date(anchor)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay() // 0 Minggu
    const mondayOffset = day === 0 ? -6 : 1 - day
    const start = new Date(d)
    start.setDate(d.getDate() + mondayOffset)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: toIsoDate(start), end: toIsoDate(end) }
}

export function monthRange(anchor = new Date()): { start: string; end: string } {
    const d = new Date(anchor)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return { start: toIsoDate(start), end: toIsoDate(end) }
}

export function toIsoDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}
