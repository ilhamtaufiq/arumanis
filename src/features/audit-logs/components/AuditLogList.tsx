import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
    History as HistoryIcon,
    Search,
    Eye,
    User as UserIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuditLogs } from '../api'
import type { AuditLog, AuditLogParams } from '../types'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export function AuditLogList() {
    const [page, setPage] = useState(1)
    const [params, setParams] = useState<AuditLogParams>({ per_page: 15 })
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', page, params],
        queryFn: () => getAuditLogs({ ...params, page })
    })

    const logs = data?.data || []
    const meta = data?.meta

    const handleFilterChange = (key: keyof AuditLogParams, value: string) => {
        setParams(prev => ({
            ...prev,
            [key]: value === 'all' ? undefined : value
        }))
        setPage(1)
    }

    const getEventBadge = (event: string) => {
        switch (event) {
            case 'created':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">CREATE</Badge>
            case 'updated':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">UPDATE</Badge>
            case 'deleted':
                return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">DELETE</Badge>
            default:
                return <Badge variant="outline">{event.toUpperCase()}</Badge>
        }
    }

    const getModelName = (type: string) => {
        const parts = type.split('\\')
        return parts[parts.length - 1]
    }

    const openDetails = (log: AuditLog) => {
        setSelectedLog(log)
        setIsDetailOpen(true)
    }

    return (
        <>
            <Header>
                <div className="flex items-center gap-2">
                    <HistoryIcon className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
                </div>
            </Header>

            <Main>
                <Card className="mb-6">
                    <CardHeader className="pb-3 text-2xl font-bold tracking-tight">
                        <CardTitle>Log Perubahan Data</CardTitle>
                        <CardDescription>
                            Daftar histori perubahan pada data pekerjaan, kontrak, dan dokumen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari tipe data (Pekerjaan, Kontrak...)"
                                        className="pl-9"
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Select onValueChange={(v) => handleFilterChange('event', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Event</SelectItem>
                                        <SelectItem value="created">Created</SelectItem>
                                        <SelectItem value="updated">Updated</SelectItem>
                                        <SelectItem value="deleted">Deleted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Waktu</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Tidak ada log aktivitas ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium text-xs">
                                                    {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <UserIcon className="h-3 w-3 text-slate-500" />
                                                        </div>
                                                        <span className="text-sm">{log.user?.name || 'System'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">
                                                    {getModelName(log.auditable_type)}
                                                </TableCell>
                                                <TableCell>
                                                    {getEventBadge(log.event)}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    #{log.auditable_id}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDetails(log)}
                                                    >
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
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {logs.length} dari {meta.total} log
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                    </Button>
                                    <div className="text-sm font-medium">
                                        Hal {page} dari {meta.last_page}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                        disabled={page === meta.last_page}
                                    >
                                        Next <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Main>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5" />
                            Detail Perubahan Data
                        </DialogTitle>
                        <DialogDescription>
                            Informasi lengkap mengenai perubahan pada {selectedLog && getModelName(selectedLog.auditable_type)} #{selectedLog?.auditable_id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-6 pt-4">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Dilakukan Oleh</p>
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{selectedLog.user?.name}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-6">{selectedLog.user?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Waktu Kejadian</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">
                                            {format(new Date(selectedLog.created_at), 'eeee, dd MMMM yyyy, HH:mm:ss', { locale: idLocale })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">IP Address</p>
                                    <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-1.5 rounded border">
                                        {selectedLog.ip_address || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">URL Aksi</p>
                                    <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-1.5 rounded border truncate">
                                        {selectedLog.url || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Values Comparison */}
                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                                    <ArrowLeftRight className="h-3 w-3" />
                                    Perbandingan Nilai DATA
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="text-[9px]">NILAI LAMA (OLD)</Badge>
                                        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border h-48 overflow-auto whitespace-pre-wrap">
                                            {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : '--- Tidak ada data lama ---'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-600">NILAI BARU (NEW)</Badge>
                                        <div className="text-xs font-mono bg-emerald-50/10 dark:bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20 h-48 overflow-auto whitespace-pre-wrap">
                                            {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : '--- Tidak ada perubahan nilai ---'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Browser / User Agent</p>
                                <div className="text-[10px] text-muted-foreground bg-slate-50 dark:bg-slate-950 p-2 rounded border leading-tight">
                                    {selectedLog.user_agent}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
