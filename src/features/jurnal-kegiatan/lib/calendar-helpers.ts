import { addDays, format, startOfMonth, startOfWeek } from 'date-fns'
import type { JurnalEntry } from '../types'

export const CALENDAR_WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as const
export const CALENDAR_CELL_COUNT = 42 // 6 baris x 7 hari, Senin di kolom pertama
export const CALENDAR_PREVIEW_LINES = 2

export type JurnalView = 'list' | 'calendar'

export interface CalendarCell {
    /** YYYY-MM-DD (tanggal lokal). */
    iso: string
    day: number
    inMonth: boolean
    isToday: boolean
    entries: JurnalEntry[]
    hasFoto: boolean
}

export function isoDate(date: Date): string {
    return format(date, 'yyyy-MM-dd')
}

/**
 * Membangun 42 sel (6 minggu) untuk bulan tertentu, mulai Senin.
 * Sel dari bulan lain ditandai inMonth=false dan tidak membawa kegiatan.
 */
export function buildMonthGrid(
    tahun: number,
    bulan: number,
    entries: ReadonlyArray<JurnalEntry>,
    today: Date = new Date(),
): CalendarCell[] {
    const gridStart = startOfWeek(startOfMonth(new Date(tahun, bulan - 1, 1)), { weekStartsOn: 1 })
    const byDate = new Map<string, JurnalEntry[]>()
    for (const entry of entries) {
        byDate.set(entry.tanggal, [...(byDate.get(entry.tanggal) ?? []), entry])
    }
    const todayIso = isoDate(today)

    return Array.from({ length: CALENDAR_CELL_COUNT }, (_, index) => {
        const date = addDays(gridStart, index)
        const iso = isoDate(date)
        const inMonth = date.getFullYear() === tahun && date.getMonth() === bulan - 1
        const dayEntries = inMonth ? (byDate.get(iso) ?? []) : []
        return {
            iso,
            day: date.getDate(),
            inMonth,
            isToday: iso === todayIso,
            entries: dayEntries,
            hasFoto: dayEntries.some((entry) => (entry.foto?.length ?? 0) > 0),
        }
    })
}

/** Baris pratinjau per kegiatan: maksimal `limit` baris, sisanya dihitung sebagai remaining. */
export function dayPreview(
    entries: ReadonlyArray<JurnalEntry>,
    limit = CALENDAR_PREVIEW_LINES,
): { lines: { key: number; text: string }[]; remaining: number } {
    const lines = entries.slice(0, limit).map((entry) => ({
        key: entry.id,
        text: `${entry.rhk !== null ? `RHK ${entry.rhk}` : '–'} · ${entry.kegiatan}`,
    }))
    return { lines, remaining: Math.max(0, entries.length - limit) }
}

/** Teks aria-label sel: tanggal lengkap, jumlah kegiatan, dan penanda hari ini. */
export function calendarCellLabel(cell: CalendarCell, tanggalLabel: string): string {
    const n = cell.entries.length
    const jumlah = n === 0 ? 'tidak ada kegiatan' : `${n} kegiatan`
    return `${tanggalLabel}, ${jumlah}${cell.isToday ? ', hari ini' : ''}`
}
