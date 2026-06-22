import { History, Megaphone, Send, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { BroadcastHistory } from '../api/broadcast'

type BroadcastHeroProps = {
    history: BroadcastHistory[]
    isLoading?: boolean
}

export function BroadcastHero({ history, isLoading }: BroadcastHeroProps) {
    const totalRecipients = history.reduce((sum, item) => sum + item.recipient_count, 0)
    const bannerCount = history.filter((item) => item.is_banner).length

    const stats = [
        {
            label: 'Total Broadcast',
            value: history.length.toLocaleString('id-ID'),
            icon: Megaphone,
        },
        {
            label: 'Total Penerima',
            value: totalRecipients.toLocaleString('id-ID'),
            icon: Users,
        },
        {
            label: 'Dengan Banner',
            value: bannerCount.toLocaleString('id-ID'),
            icon: Send,
        },
        {
            label: 'Riwayat Tersimpan',
            value: history.length > 0 ? 'Aktif' : 'Kosong',
            icon: History,
        },
    ]

    return (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-background p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                        Admin
                    </Badge>
                    <Badge variant="secondary">Broadcast Notification</Badge>
                </div>

                <div>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Kirim Pengumuman ke User
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Sampaikan informasi penting ke seluruh user atau target tertentu, termasuk opsi banner popup di dashboard.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, index) => (
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