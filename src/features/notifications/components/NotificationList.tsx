import { Skeleton } from '@/components/ui/skeleton'
import type { AppNotification } from '../api/notifications'
import { NotificationEmptyState } from './NotificationEmptyState'
import { NotificationItem } from './NotificationItem'

type NotificationListProps = {
    notifications: AppNotification[]
    isLoading?: boolean
    emptyVariant: 'all' | 'unread' | 'bell'
    onMarkRead?: (id: string) => void
    compact?: boolean
    onItemClick?: (notification: AppNotification) => void
}

export function NotificationList({
    notifications,
    isLoading = false,
    emptyVariant,
    onMarkRead,
    compact = false,
    onItemClick,
}: NotificationListProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: compact ? 3 : 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl border p-4">
                        <div className="flex gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (notifications.length === 0) {
        return <NotificationEmptyState variant={emptyVariant} />
    }

    return (
        <div className={compact ? 'flex flex-col' : 'flex flex-col gap-3'}>
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact={compact}
                    onMarkRead={onMarkRead ? () => onMarkRead(notification.id) : undefined}
                    onClick={onItemClick ? () => onItemClick(notification) : undefined}
                />
            ))}
        </div>
    )
}