import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getNotifications, markAsRead } from '../api/notifications'
import { Info, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export function BannerNotification() {
    const [open, setOpen] = useState(false)
    const [currentNotification, setCurrentNotification] = useState<any>(null)
    const [sessionDismissed, setSessionDismissed] = useState<string | null>(null)
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { data } = useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: () => getNotifications(true),
        refetchInterval: 30000, // Check every 30 seconds
    })

    const markReadMutation = useMutation({
        mutationFn: (id: string) => markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    useEffect(() => {
        if (data?.notifications) {
            const bannerNotif = data.notifications.find(
                (n: any) => (n.data.is_banner === true || n.data.is_banner === 1 || n.data.is_banner === '1') && 
                            !n.read_at && 
                            sessionDismissed !== n.id
            )
            if (bannerNotif && !currentNotification) {
                setCurrentNotification(bannerNotif)
                setOpen(true)
            }
        }
    }, [data, currentNotification, sessionDismissed])

    const handleClose = () => {
        if (currentNotification) {
            // Only dismiss for this session
            setSessionDismissed(currentNotification.id)
        }
        setOpen(false)
        setCurrentNotification(null)
    }

    const handleDismiss = () => {
        if (currentNotification) {
            markReadMutation.mutate(currentNotification.id)
        }
        setOpen(false)
        setCurrentNotification(null)
    }

    const handleAction = () => {
        if (currentNotification?.data?.url) {
            navigate({ to: currentNotification.data.url })
        }
        handleDismiss()
    }

    if (!currentNotification) return null

    const type = currentNotification.data.type || 'info'
    const icons = {
        info: <Info className="h-6 w-6 text-blue-500" />,
        success: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
        warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        error: <XCircle className="h-6 w-6 text-destructive" />,
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {icons[type as keyof typeof icons]}
                        <DialogTitle className="text-xl font-bold">
                            {currentNotification.data.title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base whitespace-pre-wrap pt-2">
                        {currentNotification.data.message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 flex-col sm:flex-row gap-2 justify-end">
                    <Button variant="ghost" onClick={handleClose}>
                        Tutup (Nanti)
                    </Button>
                    <div className="flex gap-2">
                        {currentNotification.data.url && (
                            <Button onClick={handleAction} variant="outline" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Lihat Detail
                            </Button>
                        )}
                        <Button onClick={handleDismiss} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            Saya Mengerti
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
