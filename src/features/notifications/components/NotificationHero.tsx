import { Bell, BellRing, Inbox, MailOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type NotificationHeroProps = {
    totalCount: number
    unreadCount: number
    isLoading?: boolean
}

export function NotificationHero({ totalCount, unreadCount, isLoading }: NotificationHeroProps) {
    const readCount = Math.max(0, totalCount - unreadCount)

    const stats = [
        {
            label: 'Total Notifikasi',
            value: totalCount.toLocaleString('id-ID'),
            icon: Inbox,
        },
        {
            label: 'Belum Dibaca',
            value: unreadCount.toLocaleString('id-ID'),
            icon: BellRing,
        },
        {
            label: 'Sudah Dibaca',
            value: readCount.toLocaleString('id-ID'),
            icon: MailOpen,
        },
    ]

    return (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-background p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                        <Bell className="mr-1 h-3 w-3" />
                        Pusat Notifikasi
                    </Badge>
                    {unreadCount > 0 ? (
                        <Badge variant="secondary">{unreadCount} belum dibaca</Badge>
                    ) : (
                        <Badge variant="secondary">Semua sudah dibaca</Badge>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Kelola Notifikasi Anda
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Pantau pengumuman sistem, aktivitas pekerjaan, dan update penting dari satu tempat.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, index) => (
                              <div key={index} className="rounded-xl border bg-background/80 p-4">
                                  <Skeleton className="mb-2 h-3 w-20" />
                                  <Skeleton className="h-7 w-16" />
                              </div>
                          ))
                        : stats.map((stat) => (
                              <div
                                  key={stat.label}
                                  className="rounded-xl border bg-background/80 p-4 backdrop-blur-sm transition-colors hover:border-primary/30"
                              >
                                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      <stat.icon className="h-3.5 w-3.5 text-primary" />
                                      {stat.label}
                                  </div>
                                  <p className="text-base font-bold leading-tight sm:text-lg">{stat.value}</p>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    )
}