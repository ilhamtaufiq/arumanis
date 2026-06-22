import { cn } from '@/lib/utils'
import {
    notificationTypeConfig,
    resolveNotificationType,
    type NotificationType,
} from '../lib/notification-styles'

type NotificationTypeIconProps = {
    type?: string
    size?: 'sm' | 'md' | 'lg'
    withBackground?: boolean
    className?: string
}

const sizeMap = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
}

const containerSizeMap = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
}

export function NotificationTypeIcon({
    type,
    size = 'md',
    withBackground = false,
    className,
}: NotificationTypeIconProps) {
    const resolvedType: NotificationType = resolveNotificationType(type)
    const config = notificationTypeConfig[resolvedType]
    const Icon = config.icon

    if (!withBackground) {
        return <Icon className={cn(sizeMap[size], config.iconClassName, className)} />
    }

    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full border',
                containerSizeMap[size],
                config.badgeClassName,
                className
            )}
        >
            <Icon className={cn(sizeMap[size], config.iconClassName)} />
        </div>
    )
}