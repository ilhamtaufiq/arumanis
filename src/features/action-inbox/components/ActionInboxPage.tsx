import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, BellRing, RefreshCw } from 'lucide-react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getActionInbox } from '@/features/data-quality/api'
import type { ActionInboxItem } from '@/features/data-quality/types'
import { filterActionInboxItems } from '../lib/filter-actions'

function severityBadge(severity: ActionInboxItem['severity']) {
    if (severity === 'high') return <Badge variant="destructive">Tinggi</Badge>
    if (severity === 'medium') return <Badge className="bg-amber-500 hover:bg-amber-600">Sedang</Badge>
    return <Badge variant="secondary">Rendah</Badge>
}

export default function ActionInboxPage() {
    const { tahunAnggaran } = useAppSettingsValues()

    const inboxQuery = useQuery({
        queryKey: ['action-inbox', tahunAnggaran, 'exclude-canceled'],
        queryFn: () => getActionInbox(tahunAnggaran),
        refetchInterval: 5 * 60_000,
    })

    const data = inboxQuery.data?.data
    // API sudah exclude paket canceled; guard FE untuk count 0.
    const actions = useMemo(
        () => filterActionInboxItems(data?.actions),
        [data?.actions],
    )

    return (
        <PageContainer
            pageTitle="Butuh Tindakan"
            pageDescription="Inbox aksi harian: kualitas data, tiket, dan kontrak mendekati selesai. Paket pekerjaan dibatalkan (canceled) tidak dihitung."
            pageHeaderAction={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void inboxQuery.refetch()}
                    disabled={inboxQuery.isFetching}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${inboxQuery.isFetching ? 'animate-spin' : ''}`} />
                    Muat ulang
                </Button>
            }
        >
            <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                    <BellRing className="h-4 w-4" />
                    {actions.length} item aksi
                </span>
                {data?.generated_at ? (
                    <span>· diperbarui {new Date(data.generated_at).toLocaleString('id-ID')}</span>
                ) : null}
            </div>

            {inboxQuery.isLoading ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Memuat inbox...</CardContent>
                </Card>
            ) : actions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                        <AlertTriangle className="h-8 w-8 text-emerald-600" />
                        <p className="font-medium">Tidak ada aksi mendesak</p>
                        <p className="text-sm text-muted-foreground">
                            Kualitas data, tiket, dan kontrak dalam kondisi aman untuk sekarang.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {actions.map((action) => (
                        <Card key={action.id} className="transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {severityBadge(action.severity)}
                                        <Badge variant="outline">{action.source}</Badge>
                                    </div>
                                    <CardTitle className="text-base">{action.title}</CardTitle>
                                    <CardDescription>{action.detail}</CardDescription>
                                </div>
                                <Button asChild size="sm">
                                    <a href={action.href}>Tangani</a>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-xs text-muted-foreground">Jumlah: {action.count}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </PageContainer>
    )
}
