import { useState, useMemo } from 'react';
import {
    addMonths,
    subMonths,
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addDays,
    subDays,
    startOfDay,
    endOfDay,
    eachHourOfInterval,
    isToday
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useEvents } from '../api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EventDialog } from './EventDialog';
import type { CalendarEvent } from '../types';

type ViewType = 'month' | 'week' | 'day';

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>('month');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: events = [], isLoading } = useEvents();

    const handleOpenCreate = (date: Date = new Date()) => {
        setSelectedEvent(null);
        setSelectedDate(date);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedDate(null);
        setIsDialogOpen(true);
    };

    const next = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subDays(currentDate, 7));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const today = () => setCurrentDate(new Date());

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4 animate-in fade-in duration-500">
            {/* Header Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                        <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 hover:bg-background">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 hover:bg-background">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" onClick={today}>
                        Today
                    </Button>

                    <h2 className="text-xl font-bold tracking-tight">
                        {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={view} onValueChange={(v) => setView(v as ViewType)}>
                        <SelectTrigger className="w-[120px] h-9">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="View" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button size="sm" className="h-9" onClick={() => handleOpenCreate()}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Event
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 border rounded-xl bg-background shadow-sm overflow-hidden flex flex-col relative">
                {view === 'month' && <MonthView currentDate={currentDate} events={events} onSelectDate={handleOpenCreate} onSelectEvent={handleOpenEdit} />}
                {view === 'week' && <WeekView currentDate={currentDate} events={events} onSelectDate={handleOpenCreate} onSelectEvent={handleOpenEdit} />}
                {view === 'day' && <DayView currentDate={currentDate} events={events} onSelectDate={handleOpenCreate} onSelectEvent={handleOpenEdit} />}

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] z-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
            </div>

            <EventDialog
                event={selectedEvent}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                selectedDate={selectedDate}
            />
        </div>
    );
}

function MonthView({
    currentDate,
    events,
    onSelectDate,
    onSelectEvent
}: {
    currentDate: Date;
    events: CalendarEvent[];
    onSelectDate: (date: Date) => void;
    onSelectEvent: (event: CalendarEvent) => void;
}) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 border-b bg-muted/30">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                {calendarDays.map((date, i) => {
                    const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));
                    return (
                        <div
                            key={date.toISOString()}
                            className={cn(
                                "min-h-[100px] border-r border-b p-2 transition-colors hover:bg-muted/10 cursor-pointer",
                                !isSameMonth(date, monthStart) && "bg-muted/20 text-muted-foreground/50",
                                i % 7 === 6 && "border-r-0"
                            )}
                            onClick={() => onSelectDate(date)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "flex items-center justify-center h-7 w-7 text-sm rounded-full transition-all",
                                    isToday(date) ? "bg-primary text-primary-foreground font-bold shadow-sm" : "hover:bg-muted"
                                )}>
                                    {format(date, 'd')}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectEvent(event);
                                        }}
                                        className="group relative cursor-pointer truncate text-[10px] px-1.5 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary-foreground font-medium hover:bg-primary/20 transition-all border-l-2 border-l-primary"
                                    >
                                        <div className="text-foreground truncate">{event.title}</div>
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground font-medium pl-1">
                                        + {dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function WeekView({
    currentDate,
    events,
    onSelectDate,
    onSelectEvent
}: {
    currentDate: Date;
    events: CalendarEvent[];
    onSelectDate: (date: Date) => void;
    onSelectEvent: (event: CalendarEvent) => void;
}) {
    const startDate = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, 6),
    });

    const hours = eachHourOfInterval({
        start: startOfDay(currentDate),
        end: endOfDay(currentDate),
    });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/30">
                <div className="border-r border-b" />
                {weekDays.map((day) => (
                    <div key={day.toISOString()} className="py-2 text-center border-r font-medium text-sm last:border-r-0">
                        <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</div>
                        <div className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-full mt-0.5",
                            isToday(day) && "bg-primary text-primary-foreground font-bold"
                        )}>
                            {format(day, 'd')}
                        </div>
                    </div>
                ))}
            </div>
            <ScrollArea className="flex-1">
                <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
                    {/* Hour markers */}
                    <div className="col-start-1">
                        {hours.map((hour) => (
                            <div key={hour.toISOString()} className="h-20 border-r border-b px-2 text-[10px] text-muted-foreground/70 text-right pt-2">
                                {format(hour, 'HH:mm')}
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day) => (
                        <div key={day.toISOString()} className="h-full border-r border-b last:border-r-0 relative">
                            {hours.map((hour) => (
                                <div
                                    key={hour.toISOString()}
                                    className="h-20 border-b last:border-b-0 cursor-pointer hover:bg-muted/10 transition-colors"
                                    onClick={() => {
                                        const dateWithTime = new Date(day);
                                        dateWithTime.setHours(hour.getHours());
                                        onSelectDate(dateWithTime);
                                    }}
                                />
                            ))}

                            {/* Events in columns */}
                            {events
                                .filter(e => isSameDay(new Date(e.start), day))
                                .map(event => {
                                    const startHour = new Date(event.start).getHours();
                                    const startMin = new Date(event.start).getMinutes();
                                    const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60);

                                    return (
                                        <div
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectEvent(event);
                                            }}
                                            className="absolute left-1 right-1 cursor-pointer rounded border-l-4 border-primary bg-primary/10 p-1 text-[10px] shadow-sm overflow-hidden hover:bg-primary/20 transition-all z-10"
                                            style={{
                                                top: `${(startHour + startMin / 60) * 80}px`,
                                                height: `${Math.max(duration * 80, 20)}px`,
                                            }}
                                        >
                                            <div className="font-bold truncate text-foreground">{event.title}</div>
                                            <div className="text-muted-foreground opacity-70">
                                                {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function DayView({
    currentDate,
    events,
    onSelectDate,
    onSelectEvent
}: {
    currentDate: Date;
    events: CalendarEvent[];
    onSelectDate: (date: Date) => void;
    onSelectEvent: (event: CalendarEvent) => void;
}) {
    const hours = eachHourOfInterval({
        start: startOfDay(currentDate),
        end: endOfDay(currentDate),
    });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-[80px_1fr] border-b bg-muted/30 py-3 px-4">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase">{format(currentDate, 'EEEE')}</div>
                    <div className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold mt-1",
                        isToday(currentDate) && "bg-primary text-primary-foreground shadow-md"
                    )}>
                        {format(currentDate, 'd')}
                    </div>
                </div>
                <div className="flex items-center pl-4">
                    <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
                </div>
            </div>
            <ScrollArea className="flex-1 px-4">
                <div className="grid grid-cols-[80px_1fr] relative py-4">
                    <div className="col-start-1">
                        {hours.map((hour) => (
                            <div key={hour.toISOString()} className="h-24 border-r border-b px-3 text-sm text-muted-foreground/80 text-right pt-2">
                                {format(hour, 'HH:mm')}
                            </div>
                        ))}
                    </div>
                    <div className="relative border-b border-r last:border-r-0">
                        {hours.map((hour) => (
                            <div
                                key={hour.toISOString()}
                                className="h-24 border-b last:border-b-0 cursor-pointer hover:bg-muted/5 transition-colors"
                                onClick={() => {
                                    const dateWithTime = new Date(currentDate);
                                    dateWithTime.setHours(hour.getHours());
                                    onSelectDate(dateWithTime);
                                }}
                            />
                        ))}

                        {events
                            .filter(e => isSameDay(new Date(e.start), currentDate))
                            .map(event => {
                                const startHour = new Date(event.start).getHours();
                                const startMin = new Date(event.start).getMinutes();
                                const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60);

                                return (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectEvent(event);
                                        }}
                                        className="absolute left-4 right-4 cursor-pointer rounded-lg border-l-8 border-primary bg-primary/10 p-3 shadow-md overflow-hidden animate-in slide-in-from-left duration-300 hover:bg-primary/20 transition-all z-10"
                                        style={{
                                            top: `${(startHour + startMin / 60) * 96 + 16}px`,
                                            height: `${Math.max(duration * 96, 40)}px`,
                                        }}
                                    >
                                        <div className="font-bold text-sm text-foreground mb-1">{event.title}</div>
                                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                                            {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                        </div>
                                        {event.location && (
                                            <div className="text-xs text-muted-foreground mt-2 opacity-80 italic">
                                                📍 {event.location}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
