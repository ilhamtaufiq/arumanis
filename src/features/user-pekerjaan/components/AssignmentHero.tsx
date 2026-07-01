import { Briefcase, ClipboardList, Users, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '../lib/format'
import type { UserPekerjaanAssignment } from '../api/user-pekerjaan'

type AssignmentHeroProps = {
    assignments: UserPekerjaanAssignment[]
    tahunAnggaran: string
    isLoading?: boolean
}

export function AssignmentHero({ assignments, tahunAnggaran, isLoading }: AssignmentHeroProps) {
    const uniqueUsers = new Set(assignments.map((item) => item.user_id)).size
    const totalPagu = assignments.reduce((sum, item) => sum + (item.pekerjaan_pagu || 0), 0)

    const stats = [
        {
            label: 'Total Assignment',
            value: assignments.length.toLocaleString('id-ID'),
            icon: ClipboardList,
        },
        {
            label: 'Pengawas Aktif',
            value: uniqueUsers.toLocaleString('id-ID'),
            icon: Users,
        },
        {
            label: 'Pekerjaan Ter-assign',
            value: new Set(assignments.map((item) => item.pekerjaan_id)).size.toLocaleString('id-ID'),
            icon: Briefcase,
        },
        {
            label: 'Total Pagu',
            value: formatCurrency(totalPagu),
            icon: Wallet,
        },
    ]

    return (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-background p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                        TA {tahunAnggaran}
                    </Badge>
                    <Badge variant="secondary">Penugasan Pengawas</Badge>
                </div>

                <div>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Kelola Assignment Pekerjaan
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Hubungkan pengawas lapangan dengan pekerjaan yang menjadi tanggung jawabnya di aplikasi pengawasan.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, index) => (
                              <div key={index} className="rounded-xl border bg-background/80 p-4">
                                  <Skeleton className="mb-2 h-3 w-20" />
                                  <Skeleton className="h-7 w-24" />
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