import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
    AlertTriangle,
    Bug,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    RefreshCw,
    RotateCcw,
    Search,
    Trash2,
    User,
    X,
    Eraser,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    errorLogKeys,
    useBulkDeleteErrorLogs,
    useBulkReopenErrorLogs,
    useBulkResolveErrorLogs,
    useEmptyErrorLogs,
    useErrorLogsList,
    useReopenErrorLog,
    useResolveErrorLog,
} from '../hooks/useErrorLogs'
import type { ErrorLog, ErrorLogParams } from '../types'

const sourceLabels: Record<ErrorLog['source'], string> = {
    react: 'React',
    'window.error': 'Window',
    unhandledrejection: 'Promise',
    manual: 'Manual',
}

function formatDate(value: string | null | undefined) {
    if (!value) return '-'
    return format(new Date(value), 'dd MMM yyyy, HH:mm', { locale: idLocale })
}

function getStatusBadge(log: ErrorLog) {
    if (log.resolved_at) {
        return (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                Resolved
            </Badge>
        )
    }

    return (
        <Badge variant="destructive" className="bg-destructive/10 text-destructive">
            Open
        </Badge>
    )
}

function truncate(value: string, max = 110) {
    return value.length > max ? `${value.slice(0, max)}...` : value
}

export default function ErrorLogList() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [params, setParams] = useState<ErrorLogParams>({ per_page: 15, status: 'open' })
    const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
    const [isEmptyOpen, setIsEmptyOpen] = useState(false)

    const { data, isLoading, isFetching } = useErrorLogsList({ ...params, page })

    const logs = data?.data || []
    const meta = data?.meta

    const openCount = useMemo(() => logs.filter((log) => !log.resolved_at).length, [logs])

    const resolveMutation = useResolveErrorLog()
    const reopenMutation = useReopenErrorLog()
    const bulkResolveMutation = useBulkResolveErrorLogs()
    const bulkReopenMutation = useBulkReopenErrorLogs()
    const bulkDeleteMutation = useBulkDeleteErrorLogs()
    const emptyMutation = useEmptyErrorLogs()

    const pageIds = logs.map((log) => log.id)
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))
    const somePageSelected = pageIds.some((id) => selectedIds.includes(id))
    const isBulkPending =
        bulkResolveMutation.isPending
        || bulkReopenMutation.isPending
        || bulkDeleteMutation.isPending
        || emptyMutation.isPending

    const updateParam = (key: keyof ErrorLogParams, value: string) => {
        setParams((current) => ({
            ...current,
            [key]: value === 'all' || value === '' ? undefined : value,
        }))
        setPage(1)
        setSelectedIds([])
    }

    const toggleSelectAllOnPage = (checked: boolean) => {
        if (!checked) {
            setSelectedIds((current) => current.filter((id) => !pageIds.includes(id)))
            return
        }

        setSelectedIds((current) => Array.from(new Set([...current, ...pageIds])))
    }

    const toggleSelectRow = (id: number, checked: boolean) => {
        setSelectedIds((current) => (
            checked ? Array.from(new Set([...current, id])) : current.filter((value) => value !== id)
        ))
    }

    const clearSelection = () => setSelectedIds([])

    const handleBulkResolve = () => {
        if (selectedIds.length === 0) return
        const ids = [...selectedIds]
        bulkResolveMutation.mutate(ids, {
            onSuccess: () => {
                clearSelection()
                if (selectedLog && ids.includes(selectedLog.id)) {
                    setSelectedLog((current) => current ? { ...current, resolved_at: new Date().toISOString() } : current)
                }
            },
        })
    }

    const handleBulkReopen = () => {
        if (selectedIds.length === 0) return
        const ids = [...selectedIds]
        bulkReopenMutation.mutate(ids, {
            onSuccess: () => {
                clearSelection()
                if (selectedLog && ids.includes(selectedLog.id)) {
                    setSelectedLog((current) => current ? { ...current, resolved_at: null } : current)
                }
            },
        })
    }

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return
        const ids = [...selectedIds]
        bulkDeleteMutation.mutate(ids, {
            onSuccess: () => {
                clearSelection()
                if (selectedLog && ids.includes(selectedLog.id)) {
                    setIsDetailOpen(false)
                    setSelectedLog(null)
                }
                setIsBulkDeleteOpen(false)
            },
            onSettled: () => setIsBulkDeleteOpen(false),
        })
    }

    const handleEmptyAll = () => {
        emptyMutation.mutate(undefined, {
            onSuccess: () => {
                clearSelection()
                setPage(1)
                setIsDetailOpen(false)
                setSelectedLog(null)
                setIsEmptyOpen(false)
            },
            onSettled: () => setIsEmptyOpen(false),
        })
    }

    const openDetails = (log: ErrorLog) => {
        setSelectedLog(log)
        setIsDetailOpen(true)
    }

    return (
        <>
            <Header>
                <div className="flex items-center gap-2">
                    <Bug className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Debug Reporting</h1>
                </div>
            </Header>

            <Main>
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Error</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold">{meta?.total ?? 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Open di Halaman Ini</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold text-destructive">{openCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm">
                                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                                    {isFetching ? 'Memuat data...' : 'Data terbaru'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Frontend Error Logs
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => queryClient.invalidateQueries({ queryKey: errorLogKeys.all })}
                                        disabled={isFetching || isBulkPending}
                                    >
                                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                                        Muat Ulang
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setIsEmptyOpen(true)}
                                        disabled={isBulkPending || (meta?.total ?? 0) === 0}
                                    >
                                        <Eraser className="mr-2 h-4 w-4" />
                                        Kosongkan Semua
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari pesan, URL, atau source..."
                                        value={params.search || ''}
                                        onChange={(event) => updateParam('search', event.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Select value={params.status || 'all'} onValueChange={(value) => updateParam('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={params.source || 'all'} onValueChange={(value) => updateParam('source', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Source</SelectItem>
                                        <SelectItem value="react">React</SelectItem>
                                        <SelectItem value="window.error">Window</SelectItem>
                                        <SelectItem value="unhandledrejection">Promise</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedIds.length > 0 && (
                                <div className="mb-4 flex flex-col gap-3 rounded-md border bg-muted/30 p-3 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm font-medium">
                                        {selectedIds.length} error dipilih
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleBulkResolve}
                                            disabled={isBulkPending}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Tutup
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleBulkReopen}
                                            disabled={isBulkPending}
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Buka
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setIsBulkDeleteOpen(true)}
                                            disabled={isBulkPending}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={clearSelection}
                                            disabled={isBulkPending}
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[48px]">
                                                <Checkbox
                                                    checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                                                    onCheckedChange={(checked) => toggleSelectAllOnPage(checked === true)}
                                                    aria-label="Pilih semua error di halaman ini"
                                                />
                                            </TableHead>
                                            <TableHead className="min-w-[150px]">Waktu</TableHead>
                                            <TableHead className="min-w-[110px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Source</TableHead>
                                            <TableHead className="min-w-[360px]">Pesan</TableHead>
                                            <TableHead className="min-w-[220px]">User</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-80" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : logs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                    Tidak ada error report.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            logs.map((log) => (
                                                <TableRow key={log.id} data-state={selectedIds.includes(log.id) ? 'selected' : undefined}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedIds.includes(log.id)}
                                                            onCheckedChange={(checked) => toggleSelectRow(log.id, checked === true)}
                                                            aria-label={`Pilih error ${log.id}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium">{formatDate(log.created_at)}</TableCell>
                                                    <TableCell>{getStatusBadge(log)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{sourceLabels[log.source]}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{truncate(log.message)}</div>
                                                            {log.url && (
                                                                <div className="max-w-[420px] truncate font-mono text-xs text-muted-foreground">
                                                                    {log.url}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{log.user?.name || 'Unknown'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => openDetails(log)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {meta && meta.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan {logs.length} dari {meta.total} error
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setPage((current) => Math.max(1, current - 1)); setSelectedIds([]) }} disabled={page === 1}>
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Prev
                                        </Button>
                                        <span className="text-sm font-medium">Hal {page} dari {meta.last_page}</span>
                                        <Button variant="outline" size="sm" onClick={() => { setPage((current) => Math.min(meta.last_page, current + 1)); setSelectedIds([]) }} disabled={page === meta.last_page}>
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Main>

            <ConfirmDeleteDialog
                open={isBulkDeleteOpen}
                onOpenChange={setIsBulkDeleteOpen}
                entityName={`${selectedIds.length} error log`}
                description="Error log yang dihapus tidak dapat dikembalikan."
                onConfirm={handleBulkDelete}
                isPending={bulkDeleteMutation.isPending}
            />

            <ConfirmDeleteDialog
                open={isEmptyOpen}
                onOpenChange={setIsEmptyOpen}
                entityName="semua error log"
                description={`Semua ${meta?.total ?? 0} error log akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
                onConfirm={handleEmptyAll}
                isPending={emptyMutation.isPending}
            />

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bug className="h-5 w-5" />
                            Detail Error #{selectedLog?.id}
                        </DialogTitle>
                        <DialogDescription>
                            Stack trace, context browser, dan status penyelesaian.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-5 pt-2">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedLog)}
                                    <Badge variant="outline">{sourceLabels[selectedLog.source]}</Badge>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {formatDate(selectedLog.created_at)}
                                    </span>
                                </div>
                                {selectedLog.resolved_at ? (
                                    <Button variant="outline" onClick={() => reopenMutation.mutate(selectedLog.id, { onSuccess: setSelectedLog })} disabled={reopenMutation.isPending}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Buka Ulang
                                    </Button>
                                ) : (
                                    <Button onClick={() => resolveMutation.mutate(selectedLog.id, { onSuccess: setSelectedLog })} disabled={resolveMutation.isPending}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Tandai Selesai
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Pesan</p>
                                <div className="rounded-md border bg-muted/30 p-3 text-sm">{selectedLog.message}</div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">User</p>
                                    <p className="text-sm">{selectedLog.user?.name || 'Unknown'} {selectedLog.user?.email ? `(${selectedLog.user.email})` : ''}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">IP Address</p>
                                    <p className="font-mono text-sm">{selectedLog.ip_address || '-'}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">URL</p>
                                    <p className="break-all font-mono text-sm">{selectedLog.url || '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Stack Trace</p>
                                <pre className="max-h-64 overflow-auto rounded-md border bg-slate-950 p-3 text-xs text-slate-50">
                                    {selectedLog.stack || 'Tidak ada stack trace.'}
                                </pre>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Component Stack</p>
                                    <pre className="max-h-52 overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                                        {selectedLog.component_stack || 'Tidak ada component stack.'}
                                    </pre>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Metadata</p>
                                    <pre className="max-h-52 overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                                        {selectedLog.metadata ? JSON.stringify(selectedLog.metadata, null, 2) : 'Tidak ada metadata.'}
                                    </pre>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">User Agent</p>
                                <div className="break-all rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                                    {selectedLog.user_agent || '-'}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
