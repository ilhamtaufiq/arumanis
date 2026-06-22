import { ExternalLink, MoreVertical } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '../lib/format'
import { notificationTypeConfig, resolveNotificationType } from '../lib/notification-styles'
import type { AppNotification } from '../api/notifications'
import { NotificationTypeIcon } from './NotificationTypeIcon'

type NotificationItemProps = {
    notification: AppNotification
    onMarkRead?: () => void
    compact?: boolean
    onClick?: () => void
}

export function NotificationItem({
    notification,
    onMarkRead,
    compact = false,
    onClick,
}: NotificationItemProps) {
    const isRead = !!notification.read_at
    const type = resolveNotificationType(notification.data.type)
    const typeConfig = notificationTypeConfig[type]

    const handleMarkRead = () => {
        if (!isRead) onMarkRead?.()
    }

    return (
        <div
            className={cn(
                'group relative flex items-start gap-3 rounded-xl border transition-all duration-200',
                compact ? 'p-3' : 'gap-4 p-4',
                isRead
                    ? 'bg-card/80 opacity-90'
                    : 'border-primary/20 bg-primary/5 shadow-sm'
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
        >
            <div className="mt-0.5 shrink-0">
                <NotificationTypeIcon type={type} size={compact ? 'sm' : 'md'} withBackground />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4
                                className={cn(
                                    'truncate text-sm font-semibold leading-tight',
                                    !isRead && 'text-primary'
                                )}
                            >
                                {notification.data.title}
                            </h4>
                            {!isRead ? (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                    Baru
                                </Badge>
                            ) : null}
                        </div>
                        {!compact ? (
                            <Badge
                                variant="outline"
                                className={cn('text-[10px] font-medium', typeConfig.badgeClassName)}
                            >
                                {typeConfig.label}
                            </Badge>
                        ) : null}
                    </div>
                    <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                    </span>
                </div>

                <p
                    className={cn(
                        'text-muted-foreground leading-relaxed',
                        compact ? 'line-clamp-2 text-[11px]' : 'text-sm'
                    )}
                >
                    {notification.data.message}
                </p>

                {!compact ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {notification.data.url ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 rounded-full text-xs"
                                asChild
                            >
                                <Link
                                    to={notification.data.url as '/'}
                                    onClick={handleMarkRead}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Lihat Detail
                                </Link>
                            </Button>
                        ) : null}
                        {!isRead && onMarkRead ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-full text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onMarkRead()
                                }}
                            >
                                Tandai Dibaca
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {!compact && onMarkRead ? (
                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {!isRead ? (
                                <DropdownMenuItem onClick={onMarkRead} className="text-xs">
                                    Tandai Dibaca
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : null}
        </div>
    )
}