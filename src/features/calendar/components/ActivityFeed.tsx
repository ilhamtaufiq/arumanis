import { useAuditLogs } from '../api/audit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { 
    PlusCircle, 
    Edit, 
    Trash2, 
    Activity,
    Image as ImageIcon, 
    FileText, 
    Users, 
    Calendar as CalendarIcon,
    AlertCircle,
} from 'lucide-react'
import type { AuditLog } from '../types/audit'
import { cn } from '@/lib/utils'

export function ActivityFeed() {
    const { data, isLoading, isError } = useAuditLogs({ per_page: 10 })

    if (isLoading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        Aktivitas Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="px-0 py-10 text-center text-muted-foreground">
                    Gagal memuat aktivitas.
                </CardContent>
            </Card>
        )
    }

    const logs = data?.data || []

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Aktivitas Terbaru
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-primary/20 before:via-muted/50 before:to-transparent">
                    {logs.length > 0 ? (
                        logs.map((log) => (
                            <ActivityItem key={log.id} log={log} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            Belum ada aktivitas tercatat.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function ActivityItem({ log }: { log: AuditLog }) {
    const activityInfo = getActivityDescription(log)
    
    return (
        <div className="relative flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm ring-4 ring-background z-10">
                <Avatar className="h-10 w-10 border-0">
                    <AvatarImage src={log.user?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {log.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className={cn(
                    "absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center text-white",
                    log.event === 'created' ? 'bg-emerald-500' : 
                    log.event === 'updated' ? 'bg-blue-500' : 'bg-red-500'
                )}>
                    {log.event === 'created' && <PlusCircle className="h-3 w-3" />}
                    {log.event === 'updated' && <Edit className="h-3 w-3" />}
                    {log.event === 'deleted' && <Trash2 className="h-3 w-3" />}
                </div>
            </div>
            
            <div className="flex flex-col flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                        <span className="text-primary hover:underline cursor-pointer">{log.user?.name || 'Seseorang'}</span>
                        {' '}{activityInfo.action}{' '}
                        <span className="font-semibold">{activityInfo.target}</span>
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: id })}
                    </span>
                </div>
                
                {activityInfo.detail && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                        "{activityInfo.detail}"
                    </p>
                )}
                
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">
                        {activityInfo.icon}
                        {activityInfo.typeLabel}
                    </div>
                </div>
            </div>
        </div>
    )
}

function getActivityDescription(log: AuditLog) {
    const type = log.auditable_type.split('\\').pop()
    const event = log.event
    
    let action = 'melakukan perubahan pada'
    let target = `ID #${log.auditable_id}`
    let typeLabel = type
    let detail = ''
    let icon = <FileText className="h-3 w-3" />

    switch (type) {
        case 'Foto':
            action = event === 'created' ? 'mengunggah' : (event === 'updated' ? 'memperbarui' : 'menghapus')
            target = 'foto dokumentasi'
            typeLabel = 'Dokumentasi'
            icon = <ImageIcon className="h-3 w-3" />
            detail = log.new_values?.keterangan || log.old_values?.keterangan || ''
            break
        case 'Penerima':
            action = event === 'created' ? 'mendaftarkan' : (event === 'updated' ? 'mengubah data' : 'menghapus')
            target = log.new_values?.nama || log.old_values?.nama || 'penerima manfaat'
            typeLabel = 'Penerima'
            icon = <Users className="h-3 w-3" />
            break
        case 'Pekerjaan':
            action = event === 'created' ? 'membuat' : (event === 'updated' ? 'memperbarui' : 'menghapus')
            target = log.new_values?.nama_pekerjaan || log.old_values?.nama_pekerjaan || 'data pekerjaan'
            typeLabel = 'Pekerjaan'
            icon = <Edit className="h-3 w-3" />
            break
        case 'Event':
            action = event === 'created' ? 'menambahkan' : (event === 'updated' ? 'mengubah' : 'menghapus')
            target = log.new_values?.title || log.old_values?.title || 'jadwal kegiatan'
            typeLabel = 'Kalender'
            icon = <CalendarIcon className="h-3 w-3" />
            break
        case 'Berkas':
            action = event === 'created' ? 'mengunggah' : (event === 'updated' ? 'memperbarui' : 'menghapus')
            target = 'berkas dokumen'
            typeLabel = 'Dokumen'
            icon = <FileText className="h-3 w-3" />
            detail = log.new_values?.jenis_dokumen || log.old_values?.jenis_dokumen || ''
            break
        case 'Progress':
            action = event === 'updated' ? 'memperbarui' : 'mencatat'
            target = 'progres pekerjaan'
            typeLabel = 'Progres'
            icon = <Activity className="h-3 w-3" />
            break
        case 'Kontrak':
            action = event === 'created' ? 'membuat' : (event === 'updated' ? 'mengubah' : 'menghapus')
            target = 'data kontrak'
            typeLabel = 'Kontrak'
            icon = <FileText className="h-3 w-3" />
            break
    }

    return { action, target, typeLabel, detail, icon }
}
