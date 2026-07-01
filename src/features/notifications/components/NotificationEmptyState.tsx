import { Bell, CheckCircle2, Megaphone } from 'lucide-react'

type NotificationEmptyStateProps = {
    variant: 'all' | 'unread' | 'bell' | 'broadcast'
}

const emptyContent = {
    all: {
        icon: Bell,
        title: 'Tidak Ada Notifikasi',
        description: 'Semua aktivitas dan pengumuman akan muncul di sini.',
    },
    unread: {
        icon: CheckCircle2,
        title: 'Beres! Semua Sudah Dibaca',
        description: 'Tidak ada notifikasi baru yang perlu diperiksa.',
    },
    bell: {
        icon: Bell,
        title: 'Belum Ada Notifikasi',
        description: 'Notifikasi baru akan muncul di sini.',
    },
    broadcast: {
        icon: Megaphone,
        title: 'Belum Ada Riwayat Broadcast',
        description: 'Notifikasi broadcast yang dikirim akan tercatat di sini.',
    },
}

export function NotificationEmptyState({ variant }: NotificationEmptyStateProps) {
    const content = emptyContent[variant]
    const Icon = content.icon

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                <Icon className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold text-muted-foreground">{content.title}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{content.description}</p>
        </div>
    )
}