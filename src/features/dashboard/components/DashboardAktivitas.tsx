import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuditLogs } from '@/features/calendar/api/audit'
import { describeActivity } from '../lib/activity'

const TAMPIL = 6

/** Enam aktivitas terakhir dari audit log. */
export function DashboardAktivitas() {
    const { data, isLoading } = useAuditLogs({ per_page: TAMPIL })
    const daftar = data?.data?.slice(0, TAMPIL) ?? []

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    Update terbaru dari pengguna
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Memuat aktivitas…</p>
                ) : daftar.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
                ) : (
                    <ul className="min-w-0 divide-y">
                        {daftar.map((log) => (
                            <li key={log.id} className="flex min-w-0 items-baseline justify-between gap-3 py-2.5">
                                <p className="min-w-0 truncate text-sm">
                                    <span className="font-medium">{log.user?.name ?? 'Seseorang'}</span>{' '}
                                    <span className="text-muted-foreground">{describeActivity(log)}</span>
                                </p>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.created_at), {
                                        addSuffix: true,
                                        locale: localeId,
                                    })}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <Button variant="link" size="sm" className="h-auto self-start p-0" asChild>
                    <Link to="/audit-logs">Lihat semua aktivitas</Link>
                </Button>
            </CardContent>
        </Card>
    )
}
