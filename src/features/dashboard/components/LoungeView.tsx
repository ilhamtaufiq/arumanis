import { useEvents } from '@/features/calendar/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, MoreHorizontal, ChevronRight, MapPin, FileText, Image as ImageIcon } from 'lucide-react'
import { format, isToday, isAfter, startOfDay } from 'date-fns'
import { id } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { EventDialog } from '@/features/calendar/components/EventDialog'
import { ActivityFeed } from '@/features/calendar/components/ActivityFeed'
import type { CalendarEvent } from '@/features/calendar/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoungeViewProps {
    onGoToCalendar?: () => void
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
            <div className='space-y-6 animate-in fade-in duration-500'>
                <div className='grid gap-6 md:grid-cols-2'>
                    {[1, 2].map((i) => (
                        <Card key={i} className="overflow-hidden border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map((j) => (
                                    <Skeleton key={j} className="h-20 w-full rounded-lg" />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const todayEvents = events?.filter(event => isToday(new Date(event.start))) || []
    const upcomingEvents = events?.filter(event => {
        const startDate = new Date(event.start)
        return isAfter(startDate, startOfDay(new Date())) && !isToday(startDate)
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 5) || []

    return (
        <div className='space-y-6 animate-in fade-in duration-500'>
            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-12'>
                {/* Left Column: Events */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Today's Events */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Kegiatan Hari Ini
                            </h3>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {todayEvents.length} Event
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {todayEvents.length > 0 ? (
                                todayEvents.map((event) => (
                                    <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
                                ))
                            ) : (
                                <EmptyState message="Tidak ada kegiatan untuk hari ini" />
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Mendatang
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1"
                                onClick={onGoToCalendar}
                            >
                                Lihat Kalender Full
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-1">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} isUpcoming />
                                ))
                            ) : (
                                <EmptyState message="Belum ada rencana kegiatan mendatang" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-5">
                    <div className="sticky top-20">
                        <ActivityFeed />
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <EventDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    event={selectedEvent}
                />
            )}
        </div>
    )
}

function EventCard({ event, onClick, isUpcoming = false }: { event: CalendarEvent, onClick: () => void, isUpcoming?: boolean }) {
    const hasAttachments = (event.attachments?.length || 0) > 0
    const photosCount = event.attachments?.filter(a => a.type === 'photo').length || 0
    const docsCount = event.attachments?.filter(a => a.type === 'document').length || 0

    return (
        <Card
            className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md border-muted/60"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                event.category === 'task' ? 'bg-blue-500' :
                                    event.category === 'event' ? 'bg-emerald-500' :
                                        event.category === 'milestone' ? 'bg-amber-500' :
                                            event.category === 'holiday' ? 'bg-red-500' : 'bg-slate-400'
                            )} />
                            <h4 className="font-semibold leading-none group-hover:text-primary transition-colors">
                                {event.title}
                            </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.start), 'HH:mm', { locale: id })}
                                {event.end && ` - ${format(new Date(event.end), 'HH:mm', { locale: id })}`}
                            </div>
                            {isUpcoming && (
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(new Date(event.start), 'dd MMM yyyy', { locale: id })}
                                </div>
                            )}
                            {event.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                </div>
                            )}
                        </div>

                        {hasAttachments && (
                            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-muted/40">
                                {photosCount > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                                        <ImageIcon className="h-3 w-3" />
                                        {photosCount} Foto
                                    </div>
                                )}
                                {docsCount > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-1.5 py-0.5 rounded">
                                        <FileText className="h-3 w-3" />
                                        {docsCount} Dokumen
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed rounded-xl border-muted/50 bg-muted/5">
            <p className="text-sm text-muted-foreground text-center">{message}</p>
        </div>
    )
}
