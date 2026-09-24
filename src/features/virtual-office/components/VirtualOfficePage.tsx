import { Link } from '@tanstack/react-router'
import { Building2, Users } from 'lucide-react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useOnlineUsers } from '@/features/dashboard/hooks/use-user-presence'
import { cn } from '@/lib/utils'
import '../virtual-office.css'
import {
    OFFICE_ROOMS,
    buildOccupants,
    dayPhase,
    groupOccupantsByRoom,
    occupantSlot,
    type OfficeOccupant,
    type OfficeRoom,
} from '../lib/office-layout'

const PHASE_LABEL = {
    pagi: 'Pagi',
    siang: 'Siang',
    sore: 'Sore',
    malam: 'Malam',
} as const

export default function VirtualOfficePage() {
    const { users, onlineCount, onlineWindowMinutes, isLoading, isError, currentUserId } =
        useOnlineUsers()
    const phase = dayPhase(new Date().getHours())
    const occupants = buildOccupants(users, currentUserId)
    const grouped = groupOccupantsByRoom(occupants)

    return (
        <PageContainer
            pageTitle="Kantor Virtual"
            pageDescription="Lantai kantor ARUMANIS. Klik ruangan untuk masuk. Karakter = pengguna online + AMI."
            pageHeaderAction={
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{PHASE_LABEL[phase]}</Badge>
                    <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    >
                        <Users className="h-3 w-3" />
                        {onlineCount} aktif
                    </Badge>
                </div>
            }
        >
            <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
                <section
                    className={cn(
                        'overflow-hidden rounded-2xl border shadow-sm lg:col-span-8',
                        phase === 'malam' ? 'border-indigo-500/20 bg-slate-950/40' : 'bg-card',
                    )}
                >
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <h2 className="flex items-center gap-2 text-sm font-semibold">
                            <Building2 className="h-4 w-4" />
                            Lantai 1 · Dinas
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Aktif {onlineWindowMinutes} menit terakhir
                        </p>
                    </div>
                    <div
                        className={cn(
                            'relative w-full',
                            phase === 'malam' && 'bg-indigo-950/20',
                        )}
                    >
                        {isLoading ? (
                            <Skeleton className="aspect-square w-full rounded-none" />
                        ) : (
                            <div className="relative aspect-square w-full">
                                <img
                                    src="/virtual-office/office-map.png"
                                    alt="Denah kantor virtual ARUMANIS"
                                    className="absolute inset-0 h-full w-full [image-rendering:pixelated]"
                                />
                                {OFFICE_ROOMS.map((room) => (
                                    <OfficeRoomHotspot
                                        key={room.id}
                                        room={room}
                                        occupants={grouped[room.id] ?? []}
                                    />
                                ))}
                                {occupants.map((occupant, index) => {
                                    const slot = occupantSlot(index)
                                    return (
                                        <div
                                            key={occupant.key}
                                            className="absolute -translate-x-1/2 -translate-y-full"
                                            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                                        >
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="block">
                                                        <OccupantSprite occupant={occupant} walking />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {occupant.name} ·{' '}
                                                    {occupant.pet === 'cat' ? 'kucing' : 'pug'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    {isError ? (
                        <p className="px-4 pb-4 text-sm text-muted-foreground">
                            Gagal memuat pengguna online. Ruangan tetap bisa dibuka.
                        </p>
                    ) : null}
                </section>

                <aside className="rounded-2xl border bg-card shadow-sm lg:col-span-4">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-sm font-semibold">Siapa di kantor</h2>
                        <p className="text-xs text-muted-foreground">
                            AMI di Ruang Pekerjaan. Karakter berjalan di lantai.
                        </p>
                    </div>
                    <ul className="max-h-[28rem] space-y-1 overflow-y-auto p-2">
                        {isLoading ? (
                            [1, 2, 3, 4].map((item) => (
                                <li key={item} className="flex items-center gap-3 px-2 py-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </li>
                            ))
                        ) : (
                            occupants.map((occupant) => {
                                const room = OFFICE_ROOMS.find((item) => item.id === occupant.roomId)
                                return (
                                    <li
                                        key={occupant.key}
                                        className="flex items-center gap-3 rounded-xl px-2 py-2"
                                    >
                                        <OccupantSprite occupant={occupant} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {occupant.name}
                                                {occupant.kind === 'self' ? (
                                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                        (Anda)
                                                    </span>
                                                ) : null}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {room?.name ?? occupant.roomId} ·{' '}
                                                {occupant.pet === 'cat' ? 'kucing' : 'pug'}
                                            </p>
                                        </div>
                                    </li>
                                )
                            })
                        )}
                    </ul>
                </aside>
            </div>
        </PageContainer>
    )
}

function OfficeRoomHotspot({
    room,
    occupants,
}: {
    room: OfficeRoom
    occupants: OfficeOccupant[]
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    to={room.href}
                    className={cn(
                        'absolute rounded-lg border-2 border-dashed transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        room.accent,
                    )}
                    style={{
                        left: `${room.x}%`,
                        top: `${room.y}%`,
                        width: `${room.w}%`,
                        height: `${room.h}%`,
                    }}
                >
                    <span className="absolute left-1 top-1 rounded bg-background/85 px-1.5 py-0.5 text-[10px] font-semibold leading-tight shadow-sm">
                        {room.name}
                    </span>
                    {occupants.length > 0 ? (
                        <span className="absolute bottom-1 right-1 rounded-full bg-emerald-600 px-1.5 text-[10px] font-semibold text-white">
                            {occupants.length}
                        </span>
                    ) : null}
                </Link>
            </TooltipTrigger>
            <TooltipContent>
                {room.name} — {room.hint}
                {occupants.length > 0 ? ` · ${occupants.length} orang` : ''}
            </TooltipContent>
        </Tooltip>
    )
}

function OccupantSprite({
    occupant,
    walking = false,
}: {
    occupant: OfficeOccupant
    walking?: boolean
}) {
    return (
        <span
            className={cn(
                'vo-sprite block',
                `vo-sprite-${occupant.character}`,
                walking ? 'vo-sprite-walk' : 'vo-sprite-idle',
            )}
            role="img"
            aria-label={occupant.name}
            title={occupant.name}
        />
    )
}
