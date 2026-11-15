import { Link } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEvents } from '@/features/calendar/api'
import { isTodayWib, toWib } from '@/lib/wib'

const TAMPIL = 5

/** Jadwal kegiatan hari ini (WIB). Jumlah di judul menghitung semua kegiatan, bukan hanya yang tampil. */
export function DashboardHariIni() {
    const { data: events, isLoading } = useEvents()
    const hariIni = events?.filter((e) => isTodayWib(toWib(e.start))) ?? []
    const tampil = hariIni.slice(0, TAMPIL)

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        Hari ini
                    </CardTitle>
                    {!isLoading && hariIni.length > 0 ? (
                        <p className="text-xs tabular-nums text-muted-foreground">{hariIni.length} kegiatan</p>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Memuat jadwal…</p>
                ) : tampil.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada kegiatan hari ini.</p>
                ) : (
                    <ul className="min-w-0 divide-y">
                        {tampil.map((e) => (
                            <li key={e.id} className="flex min-w-0 items-start gap-3 py-2.5">
                                <span className="w-12 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-muted-foreground sm:text-sm">
                                    {new Date(e.start).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Asia/Jakarta',
                                    })}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">{e.title}</span>
                                    {e.location ? (
                                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                            {e.location}
                                        </span>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {hariIni.length > TAMPIL ? (
                    <p className="text-xs text-muted-foreground">Dan {hariIni.length - TAMPIL} kegiatan lainnya.</p>
                ) : null}
                <Button variant="link" size="sm" className="h-auto self-start p-0 text-xs font-semibold" asChild>
                    <Link to="/calendar">Buka kalender</Link>
                </Button>
            </CardContent>
        </Card>
    )
}
