export type EventCategory = 'event' | 'task' | 'milestone' | 'holiday';

export interface CalendarEvent {
    id: string | number;
    user_id: number;
    title: string;
    isAllday: boolean;
    start: string;
    end: string;
    category: EventCategory;
    location?: string;
    description?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateEventDTO {
    title: string;
    is_allday?: boolean;
    start: string;
    end: string;
    category?: EventCategory;
    location?: string;
    description?: string;
    color?: string;
    bg_color?: string;
    border_color?: string;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> { }
