import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveVisitors } from '../hooks/use-active-visitors'

function formatVisitorPath(path: string) {
    if (!path || path === '/') {
        return '/ (Beranda)'
    }

    return path
}

export function ActiveVisitorsPanel() {
    const {
        enabled,
        visitorCount,
        viewCount,
        topPages,
        lastUpdatedAt,
        isLoading,
        isError,
    } = useActiveVisitors()

    if (!isLoading && !isError && !enabled) {
        return null
    }

    if (isLoading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Pengunjung Aktif
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                    {[1, 2, 3].map((item) => (
                        <Skeleton key={item} className="h-10 w-full rounded-lg" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="px-0 py-6 text-center text-sm text-muted-foreground">
                    Gagal memuat data pengunjung aktif.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Pengunjung Aktif
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400"
                    >
                        {visitorCount} pengunjung
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    Halaman publik · {viewCount} tampilan aktif
                    {lastUpdatedAt ? (
                        <>
                            {' '}
                            · diperbarui{' '}
                            {formatDistanceToNow(new Date(lastUpdatedAt), {
                                addSuffix: true,
                                locale: id,
                            })}
                        </>
                    ) : null}
                </p>
            </CardHeader>
            <CardContent className="px-0">
                {topPages.length > 0 ? (
                    <div className="space-y-2">
                        {topPages.map((page) => (
                            <div
                                key={page.path}
                                className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-2 py-2"
                            >
                                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                                    {formatVisitorPath(page.path)}
                                </p>
                                <Badge variant="secondary" className="shrink-0 tabular-nums">
                                    {page.views}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-muted/50 bg-muted/5 px-4 py-8 text-center text-sm text-muted-foreground">
                        Belum ada pengunjung publik yang terdeteksi saat ini.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}