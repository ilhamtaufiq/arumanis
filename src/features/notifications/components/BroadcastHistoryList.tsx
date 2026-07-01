import { useState } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { ExternalLink, History, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { ListPagination } from '@/components/shared/ListPagination'
import { getTargetLabel } from '../lib/format'
import { notificationTypeConfig, resolveNotificationType } from '../lib/notification-styles'
import type { BroadcastHistory } from '../api/broadcast'
import { useBroadcastHistory, useDeleteBroadcast } from '../hooks/useNotifications'
import { NotificationEmptyState } from './NotificationEmptyState'

export function BroadcastHistoryList() {
    const [page, setPage] = useState(1)
    const [deleteTarget, setDeleteTarget] = useState<BroadcastHistory | null>(null)

    const { data: historyData, isLoading } = useBroadcastHistory(page)
    const deleteBroadcast = useDeleteBroadcast()

    const history = historyData?.history?.data ?? []
    const pagination = historyData?.history

    const handleDelete = async () => {
        if (!deleteTarget) return
        await deleteBroadcast.mutateAsync(deleteTarget.id)
        setDeleteTarget(null)
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <History className="h-5 w-5 text-primary" />
                        Riwayat Broadcast
                    </CardTitle>
                    <CardDescription>
                        Menghapus broadcast juga menarik notifikasi dari inbox penerima yang belum membacanya.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                            Memuat riwayat...
                        </div>
                    ) : history.length === 0 ? (
                        <NotificationEmptyState variant="broadcast" />
                    ) : (
                        <>
                            <div className="hidden rounded-xl border md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Konten</TableHead>
                                            <TableHead>Target</TableHead>
                                            <TableHead>Tipe</TableHead>
                                            <TableHead>Banner</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((item) => {
                                            const typeConfig =
                                                notificationTypeConfig[resolveNotificationType(item.notification_type)]
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="whitespace-nowrap text-xs font-medium">
                                                        {format(new Date(item.created_at), 'dd MMM yyyy HH:mm', {
                                                            locale: localeId,
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex max-w-[300px] flex-col gap-1">
                                                            <span className="truncate text-sm font-semibold">
                                                                {item.title}
                                                            </span>
                                                            <span className="line-clamp-1 text-xs text-muted-foreground">
                                                                {item.message}
                                                            </span>
                                                            {item.url ? (
                                                                <span className="flex items-center gap-1 text-[10px] text-primary">
                                                                    <ExternalLink className="h-3 w-3" />
                                                                    {item.url}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <Badge variant="outline" className="w-fit text-[10px] capitalize">
                                                                {getTargetLabel(item.type)}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {item.recipient_count} penerima
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] ${typeConfig.badgeClassName}`}
                                                        >
                                                            {typeConfig.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.is_banner ? (
                                                            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-700 hover:bg-emerald-500/10">
                                                                Ya
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground">Tidak</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setDeleteTarget(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="space-y-3 md:hidden">
                                {history.map((item) => {
                                    const typeConfig =
                                        notificationTypeConfig[resolveNotificationType(item.notification_type)]
                                    return (
                                        <div key={item.id} className="rounded-xl border p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(item.created_at), 'dd MMM yyyy HH:mm', {
                                                            locale: localeId,
                                                        })}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => setDeleteTarget(item)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.message}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {getTargetLabel(item.type)}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] ${typeConfig.badgeClassName}`}
                                                >
                                                    {typeConfig.label}
                                                </Badge>
                                                {item.is_banner ? (
                                                    <Badge className="text-[10px]">Banner</Badge>
                                                ) : null}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {pagination && pagination.last_page > 1 ? (
                                <ListPagination
                                    page={pagination.current_page}
                                    totalPages={pagination.last_page}
                                    onPageChange={setPage}
                                    variant="simple"
                                />
                            ) : null}
                        </>
                    )}
                </CardContent>
            </Card>

            <ConfirmDeleteDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                entityName="Broadcast"
                description="Tindakan ini akan menghapus riwayat broadcast dan menarik kembali notifikasi dari inbox seluruh penerima yang belum membacanya."
                onConfirm={handleDelete}
                isPending={deleteBroadcast.isPending}
            />
        </>
    )
}