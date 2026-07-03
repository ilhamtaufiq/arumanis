import { useEvents } from '@/features/calendar/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Calendar as CalendarIcon,
    Clock,
    MoreHorizontal,
    ChevronRight,
    MapPin,
    FileText,
    Image as ImageIcon,
    Radio,
    Users,
} from 'lucide-react'
import { format, isToday, isAfter, startOfDay } from 'date-fns'
import { id } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { useState, type ComponentType, type ReactNode } from 'react'
import { EventDialog } from '@/features/calendar/components/EventDialog'
import { ActivityFeed } from '@/features/calendar/components/ActivityFeed'
import { ActiveVisitorsPanel } from './ActiveVisitorsPanel'
import { OnlineUsersPanel } from './OnlineUsersPanel'
import type { CalendarEvent } from '@/features/calendar/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoungeViewProps {
    onGoToCalendar?: () => void
}

function PanelShell({
    title,
    icon: Icon,
    accentClass,
    action,
    children,
}: {
    title: string
    icon: ComponentType<{ className?: string }>
    accentClass: string
    action?: ReactNode
    children: ReactNode
}) {
    return (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className={cn('flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5', accentClass)}>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4" />
                    {title}
                </h3>
                {action}
            </div>
            <div className="p-4 sm:p-5">{children}</div>
        </section>
    )
}

export function LoungeView({ onGoToCalendar }: LoungeViewProps) {
    const { data: events, isLoading } = useEvents()
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setIsDialogOpen(true)
    }

    if (isLoading) {
        return (
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="rounded-2xl border bg-card p-5">
                            <Skeleton className="mb-4 h-5 w-40" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((j) => (
                                    <Skeleton key={j} className="h-20 w-full rounded-xl" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-5 xl:col-span-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    const todayEvents = events?.filter((event) => isToday(new Date(event.start))) || []
    const upcomingEvents = events?.filter((event) => {
        const startDate = new Date(event.start)
        return isAfter(startDate, startOfDay(new Date())) && !isToday(startDate)
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 5) || []

    return (
        <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
                <div className="space-y-5 xl:col-span-8">
                    <PanelShell
                        title="Kegiatan Hari Ini"
                        icon={CalendarIcon}
                        accentClass="bg-primary/5"
                        action={(
                            <Badge variant="outline" className="border-primary/20 bg-background text-primary">
                                {todayEvents.length} event
                            </Badge>
                        )}
                    >
                        <div className="space-y-3">
                            {todayEvents.length > 0 ? (
                                todayEvents.map((event) => (
                                    <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
                                ))
                            ) : (
                                <EmptyState message="Tidak ada kegiatan untuk hari ini" />
                            )}
                        </div>
                    </PanelShell>

                    <PanelShell
                        title="Mendatang"
                        icon={Clock}
                        accentClass="bg-amber-500/8"
                        action={(
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-primary hover:bg-primary/5 hover:text-primary"
                                onClick={onGoToCalendar}
                            >
                                Kalender
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    >
                        <div className="space-y-3">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onClick={() => handleEventClick(event)}
                                        isUpcoming
                                    />
                                ))
                            ) : (
                                <EmptyState message="Belum ada rencana kegiatan mendatang" />
                            )}
                        </div>
                    </PanelShell>
                </div>

                <div className="space-y-5 xl:col-span-4">
                    <div className="xl:sticky xl:top-24 xl:space-y-5">
                        <PanelShell
                            title="Pengunjung Aktif"
                            icon={Radio}
                            accentClass="bg-emerald-500/8"
                        >
                            <ActiveVisitorsPanel />
                        </PanelShell>

                        <PanelShell
                            title="Pengguna Online"
                            icon={Users}
                            accentClass="bg-blue-500/8"
                        >
                            <OnlineUsersPanel />
                        </PanelShell>

                        <PanelShell
                            title="Aktivitas Terbaru"
                            icon={Clock}
                            accentClass="bg-muted/60"
                        >
                            <ActivityFeed />
                        </PanelShell>
                    </div>
                </div>
            </div>

            {selectedEvent ? (
                <EventDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    event={selectedEvent}
                />
            ) : null}
        </div>
    )
}

function EventCard({
    event,
    onClick,
    isUpcoming = false,
}: {
    event: CalendarEvent
    onClick: () => void
    isUpcoming?: boolean
}) {
    const hasAttachments = (event.attachments?.length || 0) > 0
    const photosCount = event.attachments?.filter((a) => a.type === 'photo').length || 0
    const docsCount = event.attachments?.filter((a) => a.type === 'document').length || 0

    return (
        <Card
            className="group cursor-pointer border-border/70 transition-all hover:border-primary/35 hover:shadow-md"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'h-2 w-2 shrink-0 rounded-full',
                                    event.category === 'task' ? 'bg-blue-500'
                                        : event.category === 'event' ? 'bg-emerald-500'
                                            : event.category === 'milestone' ? 'bg-amber-500'
                                                : event.category === 'holiday' ? 'bg-red-500' : 'bg-slate-400',
                                )}
                            />
                            <h4 className="truncate font-semibold leading-none transition-colors group-hover:text-primary">
                                {event.title}
                            </h4>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.start), 'HH:mm', { locale: id })}
                                {event.end && ` - ${format(new Date(event.end), 'HH:mm', { locale: id })}`}
                            </div>
                            {isUpcoming ? (
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(new Date(event.start), 'dd MMM yyyy', { locale: id })}
                                </div>
                            ) : null}
                            {event.location ? (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                </div>
                            ) : null}
                        </div>

                        {hasAttachments ? (
                            <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-2">
                                {photosCount > 0 ? (
                                    <div className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                                        <ImageIcon className="h-3 w-3" />
                                        {photosCount} Foto
                                    </div>
                                ) : null}
                                {docsCount > 0 ? (
                                    <div className="flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-600 dark:text-blue-400">
                                        <FileText className="h-3 w-3" />
                                        {docsCount} Dokumen
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8">
            <p className="text-center text-sm text-muted-foreground">{message}</p>
        </div>
    )
}