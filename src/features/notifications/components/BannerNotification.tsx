import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isBannerNotification } from '../lib/format'
import { notificationTypeConfig, resolveNotificationType } from '../lib/notification-styles'
import type { AppNotification } from '../api/notifications'
import {
    extractNotificationList,
    useMarkNotificationRead,
    useUnreadNotifications,
} from '../hooks/useNotifications'
import { NotificationTypeIcon } from './NotificationTypeIcon'

export function BannerNotification() {
    const [open, setOpen] = useState(false)
    const [currentNotification, setCurrentNotification] = useState<AppNotification | null>(null)
    const [sessionDismissed, setSessionDismissed] = useState<string | null>(null)
    const navigate = useNavigate()

    const { data } = useUnreadNotifications(30000)
    const markRead = useMarkNotificationRead()

    useEffect(() => {
        const notifications = extractNotificationList(data)
        const bannerNotif = notifications.find(
            (notification) =>
                isBannerNotification(notification.data.is_banner) &&
                !notification.read_at &&
                sessionDismissed !== notification.id
        )

        if (bannerNotif && !currentNotification) {
            setCurrentNotification(bannerNotif)
            setOpen(true)
        }
    }, [data, currentNotification, sessionDismissed])

    const handleClose = () => {
        if (currentNotification) {
            setSessionDismissed(currentNotification.id)
        }
        setOpen(false)
        setCurrentNotification(null)
    }

    const handleDismiss = () => {
        if (currentNotification) {
            markRead.mutate(currentNotification.id)
        }
        setOpen(false)
        setCurrentNotification(null)
    }

    const handleAction = () => {
        if (currentNotification?.data?.url) {
            navigate({ to: currentNotification.data.url as '/' })
        }
        handleDismiss()
    }

    if (!currentNotification) return null

    const type = resolveNotificationType(currentNotification.data.type)
    const typeConfig = notificationTypeConfig[type]

    return (
        <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
            <DialogContent className="overflow-hidden p-0 sm:max-w-[480px]">
                <div
                    className={cn(
                        'border-b bg-gradient-to-br px-6 py-5',
                        typeConfig.accentClassName
                    )}
                >
                    <DialogHeader className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                            <NotificationTypeIcon type={type} size="lg" withBackground />
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold leading-tight">
                                    {currentNotification.data.title}
                                </DialogTitle>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Pengumuman Penting
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-6 py-4">
                    <DialogDescription className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                        {currentNotification.data.message}
                    </DialogDescription>
                </div>

                <DialogFooter className="flex-col gap-2 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
                    <Button variant="ghost" onClick={handleClose}>
                        Tutup (Nanti)
                    </Button>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {currentNotification.data.url ? (
                            <Button onClick={handleAction} variant="outline" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Lihat Detail
                            </Button>
                        ) : null}
                        <Button onClick={handleDismiss} className="gap-2">
                            Saya Mengerti
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}