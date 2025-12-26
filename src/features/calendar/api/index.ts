import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';
import type { CalendarEvent, CreateEventDTO, UpdateEventDTO } from '../types';

export const calendarKeys = {
    all: ['events'] as const,
    lists: () => [...calendarKeys.all, 'list'] as const,
    list: (filters: string) => [...calendarKeys.lists(), { filters }] as const,
    details: () => [...calendarKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...calendarKeys.details(), id] as const,
};

export const getEvents = async (): Promise<CalendarEvent[]> => {
    const response = await api.get<{ data: CalendarEvent[] }>('/events');
    return response.data;
};

export const useEvents = () => {
    return useQuery({
        queryKey: calendarKeys.lists(),
        queryFn: getEvents,
    });
};

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateEventDTO) => api.post('/events', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.lists() });
        },
    });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: UpdateEventDTO }) =>
            api.put(`/events/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.lists() });
        },
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => api.delete(`/events/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.lists() });
        },
    });
};
