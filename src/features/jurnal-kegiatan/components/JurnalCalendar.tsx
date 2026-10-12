import { useMemo } from 'react'
import { ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    buildMonthGrid,
    calendarCellLabel,
    CALENDAR_WEEKDAYS,
    dayPreview,
    type CalendarCell,
} from '../lib/calendar-helpers'
import { formatTanggal, rhkLegend, rhkTone } from '../lib/jurnal-helpers'
import type { JurnalEntry } from '../types'

interface JurnalCalendarProps {
    tahun: number
    bulan: number
    entries: JurnalEntry[]
    selectedIso: string | null
    onSelectDate: (iso: string) => void
}

export default function JurnalCalendar({ tahun, bulan, entries, selectedIso, onSelectDate }: JurnalCalendarProps) {
    const cells = useMemo(() => buildMonthGrid(tahun, bulan, entries), [tahun, bulan, entries])
    const legend = useMemo(() => rhkLegend(entries), [entries])

    return (
        <div className="min-w-0 space-y-2">
            <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 text-center text-xs font-medium text-muted-foreground" aria-hidden>
                {CALENDAR_WEEKDAYS.map((label) => (
                    <span key={label} className="truncate">{label}</span>
                ))}
            </div>
            <div role="group" aria-label="Kalender kegiatan" className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1">
                {cells.map((cell) => (
                    <CalendarDay
                        key={cell.iso}
                        cell={cell}
                        selected={selectedIso === cell.iso}
                        onSelect={onSelectDate}
                    />
                ))}
            </div>
            {legend.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground" aria-label="Legenda RHK">
                    {legend.map((rhk) => (
                        <li key={rhk} className="flex items-center gap-1.5">
                            <span className={cn('h-2.5 w-2.5 rounded-full', rhkTone(rhk).dot)} aria-hidden />
                            RHK {rhk}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function CalendarDay({ cell, selected, onSelect }: { cell: CalendarCell; selected: boolean; onSelect: (iso: string) => void }) {
    const count = cell.entries.length
    const preview = dayPreview(cell.entries)

    return (
        <button
            type="button"
            disabled={!cell.inMonth}
            onClick={() => onSelect(cell.iso)}
            aria-label={calendarCellLabel(cell, formatTanggal(cell.iso))}
            aria-current={cell.isToday ? 'date' : undefined}
            className={cn(
                'flex min-h-16 min-w-0 flex-col gap-1 overflow-hidden rounded-md border p-1 text-left text-xs sm:min-h-24 sm:p-2',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                cell.inMonth ? 'bg-card hover:bg-accent' : 'cursor-default bg-muted/40 text-muted-foreground opacity-50',
                cell.isToday && 'border-primary',
                selected && 'ring-2 ring-primary',
            )}
        >
            <span className="flex min-w-0 items-center justify-between gap-1">
                <span className={cn('font-semibold tabular-nums', cell.isToday && 'text-primary')}>{cell.day}</span>
                {cell.inMonth && (
                    <span className="flex shrink-0 items-center gap-1">
                        {cell.hasFoto && <ImageIcon className="h-3 w-3 text-muted-foreground" aria-hidden />}
                        {count > 0 && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                                {count}
                            </Badge>
                        )}
                    </span>
                )}
            </span>
            {cell.inMonth &&
                preview.lines.map((line) => (
                    <span key={line.key} className="flex min-w-0 items-center gap-1 text-[11px] leading-tight">
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', rhkTone(line.rhk).dot)} aria-hidden />
                        <span className="truncate">{line.text}</span>
                    </span>
                ))}
            {cell.inMonth && preview.remaining > 0 && (
                <span className="text-[11px] text-muted-foreground">+{preview.remaining}</span>
            )}
        </button>
    )
}

interface JurnalDayHeaderProps {
    iso: string | null
    entries: JurnalEntry[]
    onAdd: (iso: string) => void
}

/** Judul panel kegiatan untuk tanggal terpilih, beserta tombol tambah di tanggal itu. */
export function JurnalDayHeader({ iso, entries, onAdd }: JurnalDayHeaderProps) {
    if (!iso) return null
    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                <p className="font-semibold">Kegiatan {formatTanggal(iso)}</p>
                <p className="text-sm text-muted-foreground">{entries.length} kegiatan</p>
            </div>
            <Button size="sm" onClick={() => onAdd(iso)}>
                Tambah di tanggal ini
            </Button>
        </div>
    )
}
