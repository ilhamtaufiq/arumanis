import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    AlertTriangle,
    Bell,
    Briefcase,
    ChevronRight,
    Ticket,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getNotifications } from '@/features/notifications/api/notifications'
import { getTiketList } from '@/features/tiket/api/tiket'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { cn } from '@/lib/utils'

type QueueItem = {
    id: string
    title: string
    meta: string
    tone: 'danger' | 'warning' | 'info' | 'default'
} & (
    | { kind: 'pekerjaan'; pekerjaanId: number }
    | { kind: 'path'; path: '/tiket' | '/notifications' | '/pekerjaan' | '/map' }
    | { kind: 'external'; href: string }
)

function toneClass(tone: QueueItem['tone']) {
    switch (tone) {
        case 'danger':
            return 'border-destructive/25 bg-destructive/5'
        case 'warning':
            return 'border-amber-500/25 bg-amber-500/5'
        case 'info':
            return 'border-blue-500/25 bg-blue-500/5'
        default:
            return 'border-border/70 bg-background'
    }
}

function QueueLink({
    item,
    children,
    className,
}: {
    item: QueueItem
    children: ReactNode
    className?: string
}) {
    if (item.kind === 'pekerjaan') {
        return (
            <Link
                to="/pekerjaan/$id"
                params={{ id: String(item.pekerjaanId) }}
                className={className}
            >
                {children}
            </Link>
        )
    }
    if (item.kind === 'path') {
        return (
            <Link to={item.path} className={className}>
                {children}
            </Link>
        )
    }
    return (
        <a href={item.href} className={className}>
            {children}
        </a>
    )
}

export function WorkQueuePanel() {
    const { tahunAnggaran } = useAppSettingsValues()
    const user = useAuthStore((s) => s.auth.user)
    const isManager = user?.roles?.some((r) => r === 'admin' || r === 'manager') ?? false

    const { data: notifData, isLoading: loadingNotif } = useQuery({
        queryKey: ['dashboard-work-queue', 'notifications'],
        queryFn: () => getNotifications(true),
        staleTime: 30_000,
    })

    const { data: tiketData, isLoading: loadingTiket } = useQuery({
        queryKey: ['dashboard-work-queue', 'tiket'],
        queryFn: () => getTiketList({ per_page: 5, status: 'open' }),
        staleTime: 30_000,
    })

    const { data: staleJobs, isLoading: loadingJobs } = useQuery({
        queryKey: ['dashboard-work-queue', 'stale-jobs', tahunAnggaran],
        queryFn: async () => {
            const res = await getPekerjaan({
                per_page: 50,
                tahun: tahunAnggaran,
                sort_by: 'updated_at',
                sort_direction: 'asc',
            })
            return (res.data ?? [])
                .filter((job) => {
                    const progress = Number(job.progress_total ?? 0)
                    const deviasi = Number(job.deviasi ?? 0)
                    return progress < 100 && (deviasi < -5 || (job.foto_count ?? 0) === 0)
                })
                .slice(0, 5)
        },
        enabled: isManager,
        staleTime: 60_000,
    })

    const isLoading = loadingNotif || loadingTiket || (isManager && loadingJobs)

    const items: QueueItem[] = []

    for (const n of notifData?.notifications?.slice(0, 4) ?? []) {
        const url = n.data.url
        items.push({
            id: `n-${n.id}`,
            title: n.data.title || 'Notifikasi',
            meta: n.data.message || 'Belum dibaca',
            tone: n.data.type === 'error' || n.data.type === 'warning' ? 'warning' : 'info',
            ...(url && url.startsWith('/')
                ? { kind: 'external' as const, href: url }
                : { kind: 'path' as const, path: '/notifications' as const }),
        })
    }

    for (const t of tiketData?.data?.slice(0, 4) ?? []) {
        items.push({
            id: `t-${t.id}`,
            title: t.subjek,
            meta: `Tiket #${t.id} · ${t.prioritas} · ${t.status}`,
            tone: t.prioritas === 'high' ? 'danger' : 'warning',
            kind: 'path',
            path: '/tiket',
        })
    }

    for (const job of staleJobs ?? []) {
        items.push({
            id: `j-${job.id}`,
            title: job.nama_paket,
            meta: `Perlu perhatian · progres ${job.progress_total ?? 0}% · foto ${job.foto_count ?? 0}`,
            tone: 'danger',
            kind: 'pekerjaan',
            pekerjaanId: job.id,
        })
    }

    const unread = notifData?.unread_count ?? 0
    const openTickets = tiketData?.meta?.total ?? tiketData?.data?.length ?? 0

    return (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-violet-500/8 px-4 py-3 sm:px-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    Antrian Kerja Saya
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Bell className="h-3 w-3" />
                        {unread} unread
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Ticket className="h-3 w-3" />
                        {openTickets} tiket open
                    </Badge>
                </div>
            </div>

            <div className="space-y-2 p-4 sm:p-5">
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                        Tidak ada antrian mendesak. Kerja bagus!
                    </div>
                ) : (
                    items.slice(0, 8).map((item) => (
                        <QueueLink
                            key={item.id}
                            item={item}
                            className={cn(
                                'flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors hover:border-primary/35',
                                toneClass(item.tone),
                            )}
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{item.title}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.meta}</p>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        </QueueLink>
                    ))
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                        <Link to="/pekerjaan">
                            <Briefcase className="h-3.5 w-3.5" />
                            Pekerjaan
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                        <Link to="/tiket">
                            <Ticket className="h-3.5 w-3.5" />
                            Tiket
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                        <Link to="/notifications">
                            <Bell className="h-3.5 w-3.5" />
                            Notifikasi
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                        <Link to="/map">Peta</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
