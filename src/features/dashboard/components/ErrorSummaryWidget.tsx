import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AlertOctagon, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorLogs } from '@/features/error-logs/api'
import { useAuthStore } from '@/stores/auth-stores'

export function ErrorSummaryWidget() {
    const isAdmin = useAuthStore((s) => s.auth.user?.roles?.includes('admin') ?? false)

    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard-error-summary'],
        queryFn: async () => {
            const [open, recent] = await Promise.all([
                getErrorLogs({ status: 'open', per_page: 5, page: 1 }),
                getErrorLogs({ per_page: 5, page: 1 }),
            ])
            return {
                openCount: open.meta?.total ?? open.data?.length ?? 0,
                open: open.data ?? [],
                recent: recent.data ?? [],
            }
        },
        enabled: isAdmin,
        staleTime: 60_000,
        retry: false,
    })

    if (!isAdmin) return null
    if (error) return null

    return (
        <Card className="border-destructive/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <AlertOctagon className="h-4 w-4 text-destructive" />
                        Ringkasan Error Sistem
                    </CardTitle>
                    <Badge variant="destructive" className="tabular-nums">
                        {isLoading ? '…' : `${data?.openCount ?? 0} open`}
                    </Badge>
                </div>
                <CardDescription>
                    Error runtime belum diselesaikan (admin).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (data?.open.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">Tidak ada error open.</p>
                ) : (
                    data?.open.slice(0, 4).map((item) => (
                        <div
                            key={item.id}
                            className="rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2"
                        >
                            <p className="truncate text-sm font-medium">{item.message}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {item.source} · {new Date(item.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    ))
                )}
                <Link
                    to="/error-logs"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                    Buka error logs
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    )
}
