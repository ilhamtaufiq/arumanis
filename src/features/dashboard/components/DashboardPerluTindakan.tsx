import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { BellRing } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getNotifications } from '@/features/notifications/api/notifications'
import { getTiketList } from '@/features/tiket/api/tiket'

type TiketRingkas = { id: number; subjek: string }

/** Notifikasi belum dibaca dan tiket terbuka. Ditampilkan paling atas karena butuh tindakan. */
export function DashboardPerluTindakan() {
    const { data: notifData } = useQuery({
        queryKey: ['dashboard-mini', 'notifications'],
        queryFn: () => getNotifications(true),
        staleTime: 30_000,
    })

    const { data: tiketData } = useQuery({
        queryKey: ['dashboard-mini', 'tiket'],
        queryFn: () => getTiketList({ per_page: 5, status: 'open' }),
        staleTime: 30_000,
    })

    const notifikasi = notifData?.notifications?.slice(0, 3) ?? []
    // Bentuk respons tiket tidak seragam, jadi dibaca secara defensif.
    const tiket: TiketRingkas[] =
        (tiketData as unknown as { data?: TiketRingkas[] } | undefined)?.data?.slice(0, 3) ?? []
    const kosong = notifikasi.length === 0 && tiket.length === 0

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <BellRing className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    Perlu tindakan
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {kosong ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada yang mendesak.</p>
                ) : (
                    <ul className="min-w-0 divide-y">
                        {notifikasi.map((n) => (
                            <li key={`notif-${n.id}`} className="min-w-0 py-2.5">
                                <p className="truncate text-sm font-medium">{n.data.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{n.data.message}</p>
                            </li>
                        ))}
                        {tiket.map((t) => (
                            <li key={`tiket-${t.id}`} className="flex min-w-0 items-center justify-between gap-2 py-2.5">
                                <p className="truncate text-sm font-medium">{t.subjek}</p>
                                <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">
                                    Tiket #{t.id}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <Button variant="link" size="sm" className="h-auto p-0 font-semibold" asChild>
                        <Link to="/tiket">Buka tiket</Link>
                    </Button>
                    <span className="text-muted-foreground/40">•</span>
                    <Button variant="link" size="sm" className="h-auto p-0 font-semibold" asChild>
                        <Link to="/pekerjaan">Pekerjaan</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
