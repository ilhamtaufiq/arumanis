import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Bell,
    CheckCheck,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Info,
    ExternalLink,
    MoreVertical,
    Trash2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications'

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

export default function NotificationCenterPage() {
    const queryClient = useQueryClient()
    const [tab, setTab] = useState<'all' | 'unread'>('all')

    const { data, isLoading } = useQuery({
        queryKey: ['notifications', { unreadOnly: tab === 'unread' }],
        queryFn: () => getNotifications(tab === 'unread'),
    })

    const mutationMarkRead = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const mutationMarkAllRead = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const notifications = data?.notifications || []
    // Handle both array (unread_only: true) and paginated object (unread_only: false)
    const notificationList = Array.isArray(notifications) ? notifications : (notifications as any).data || []
    const unreadCount = data?.unread_count || 0;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        Pusat Notifikasi
                    </CardTitle>
                    <CardDescription>
                        Kelola dan lihat semua riwayat notifikasi Anda.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mutationMarkAllRead.mutate()}
                        disabled={mutationMarkAllRead.isPending || unreadCount === 0}
                    >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Tandai Semua Dibaca
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <Tabs defaultValue="all" onValueChange={(v) => setTab(v as any)} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="unread" className="relative">
                            Belum Dibaca
                            {unreadCount > 0 && (
                                <Badge className="ml-2 px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center pointer-events-none">
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                        {isLoading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : notificationList.length === 0 ? (
                            <div className="text-center py-20 border rounded-lg bg-muted/20">
                                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-medium text-muted-foreground">Tidak Ada Notifikasi</h3>
                                <p className="text-sm text-muted-foreground">Semua aktivitas Anda akan muncul di sini.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {notificationList.map((notification: any) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkRead={() => mutationMarkRead.mutate(notification.id)}
                                        getIcon={getIcon}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="unread" className="mt-0">
                        {isLoading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : notificationList.length === 0 ? (
                            <div className="text-center py-20 border rounded-lg bg-muted/20">
                                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-medium text-muted-foreground">Beres! Semua Sudah Dibaca</h3>
                                <p className="text-sm text-muted-foreground">Tidak ada notifikasi baru yang perlu diperiksa.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {notificationList.map((notification: any) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkRead={() => mutationMarkRead.mutate(notification.id)}
                                        getIcon={getIcon}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

function NotificationItem({ notification, onMarkRead, getIcon }: { notification: any, onMarkRead: () => void, getIcon: (type: string) => any }) {
    const isRead = !!notification.read_at;

    return (
        <div className={cn(
            "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
            isRead ? "bg-card opacity-80" : "bg-primary/5 border-primary/20 shadow-sm"
        )}>
            <div className="mt-1 shrink-0">
                {getIcon(notification.data.type || 'info')}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                        "text-sm font-semibold leading-none",
                        !isRead && "text-primary"
                    )}>
                        {notification.data.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-medium">
                        {timeAgo(notification.created_at)}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {notification.data.message}
                </p>
                <div className="flex items-center gap-3 pt-2">
                    {notification.data.url && (
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-2 rounded-full" asChild>
                            <Link to={notification.data.url as any} onClick={() => !isRead && onMarkRead()}>
                                <ExternalLink className="h-3 w-3" />
                                Lihat Detail
                            </Link>
                        </Button>
                    )}
                    {!isRead && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                            onClick={onMarkRead}
                        >
                            Tandai Dibaca
                        </Button>
                    )}
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {!isRead && (
                            <DropdownMenuItem onClick={onMarkRead} className="text-xs">
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                Tandai Dibaca
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-xs text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Hapus (Soon)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
