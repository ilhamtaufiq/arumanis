import { Bell, CheckCheck } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
    extractNotificationList,
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useUnreadNotifications,
} from '../hooks/useNotifications'
import type { AppNotification } from '../api/notifications'
import { NotificationList } from './NotificationList'

export function NotificationBell({ variant = 'default' }: { variant?: 'default' | 'menu-item' }) {
    const navigate = useNavigate()
    const { data, isLoading } = useUnreadNotifications()
    const markRead = useMarkNotificationRead()
    const markAllRead = useMarkAllNotificationsRead()

    const notifications = extractNotificationList(data)
    const unreadCount = data?.unread_count ?? 0

    const handleItemClick = (notification: AppNotification) => {
        if (!notification.read_at) {
            markRead.mutate(notification.id)
        }
        if (notification.data.url) {
            navigate({ to: notification.data.url as '/' })
        }
    }

    const trigger =
        variant === 'menu-item' ? (
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifikasi</span>
                {unreadCount > 0 ? (
                    <Badge
                        variant="destructive"
                        className="ml-auto flex h-5 w-5 items-center justify-center p-0 text-[10px]"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                ) : null}
            </DropdownMenuItem>
        ) : (
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                    <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 flex h-5 w-5 animate-in zoom-in items-center justify-center p-0 text-[10px]"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                ) : null}
            </Button>
        )

    return (
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>

            <PopoverContent className="w-96 p-0" align="end">
                <div className="border-b bg-gradient-to-r from-primary/8 to-background p-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h4 className="text-sm font-semibold">Notifikasi</h4>
                            <p className="text-[11px] text-muted-foreground">
                                {unreadCount > 0
                                    ? `${unreadCount} belum dibaca`
                                    : 'Semua sudah dibaca'}
                            </p>
                        </div>
                        {unreadCount > 0 ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[10px]"
                                onClick={() => markAllRead.mutate()}
                                disabled={markAllRead.isPending}
                            >
                                <CheckCheck className="mr-1 h-3 w-3" />
                                Tandai semua
                            </Button>
                        ) : null}
                    </div>
                </div>

                <ScrollArea className="h-[380px]">
                    <div className="p-2">
                        <NotificationList
                            notifications={notifications}
                            isLoading={isLoading}
                            emptyVariant="bell"
                            compact
                            onMarkRead={(id) => markRead.mutate(id)}
                            onItemClick={handleItemClick}
                        />
                    </div>
                </ScrollArea>

                <div className="border-t p-2 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <Link to="/notifications">Lihat Semua Notifikasi</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}