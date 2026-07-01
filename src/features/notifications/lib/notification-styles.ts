import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Info,
    type LucideIcon,
} from 'lucide-react'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export const notificationTypeConfig: Record<
    NotificationType,
    {
        label: string
        icon: LucideIcon
        iconClassName: string
        badgeClassName: string
        accentClassName: string
    }
> = {
    info: {
        label: 'Info',
        icon: Info,
        iconClassName: 'text-blue-500',
        badgeClassName: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
        accentClassName: 'from-blue-500/15 via-background to-background',
    },
    success: {
        label: 'Sukses',
        icon: CheckCircle2,
        iconClassName: 'text-emerald-500',
        badgeClassName: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
        accentClassName: 'from-emerald-500/15 via-background to-background',
    },
    warning: {
        label: 'Peringatan',
        icon: AlertTriangle,
        iconClassName: 'text-amber-500',
        badgeClassName: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        accentClassName: 'from-amber-500/15 via-background to-background',
    },
    error: {
        label: 'Error',
        icon: AlertCircle,
        iconClassName: 'text-destructive',
        badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20',
        accentClassName: 'from-destructive/15 via-background to-background',
    },
}

export function resolveNotificationType(type?: string): NotificationType {
    if (type && type in notificationTypeConfig) {
        return type as NotificationType
    }
    return 'info'
}