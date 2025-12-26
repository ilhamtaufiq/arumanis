import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '../api';
import type { CalendarEvent, CreateEventDTO } from '../types';
import { useEffect } from 'react';
import { format } from 'date-fns';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    is_allday: z.boolean(),
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required'),
    category: z.enum(['event', 'task', 'milestone', 'holiday']),
    location: z.string().optional(),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EventDialogProps {
    event?: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: Date | null;
}

export function EventDialog({ event, isOpen, onClose, selectedDate }: EventDialogProps) {
    const createMutation = useCreateEvent();
    const updateMutation = useUpdateEvent();
    const deleteMutation = useDeleteEvent();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            is_allday: false,
            start: '',
            end: '',
            category: 'event',
            location: '',
            description: '',
        },
    });

    useEffect(() => {
        if (event) {
            form.reset({
                title: event.title,
                is_allday: event.isAllday,
                start: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
                end: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"),
                category: event.category,
                location: event.location || '',
                description: event.description || '',
            });
        } else if (selectedDate) {
            const start = format(selectedDate, "yyyy-MM-dd'T'HH:mm");
            const end = format(new Date(selectedDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm");
            form.reset({
                title: '',
                is_allday: false,
                start,
                end,
                category: 'event',
                location: '',
                description: '',
            });
        } else {
            form.reset({
                title: '',
                is_allday: false,
                start: '',
                end: '',
                category: 'event',
                location: '',
                description: '',
            });
        }
    }, [event, selectedDate, form, isOpen]);

    const onSubmit = (values: FormValues) => {
        if (event) {
            updateMutation.mutate(
                { id: event.id, data: values as CreateEventDTO },
                { onSuccess: onClose }
            );
        } else {
            createMutation.mutate(values as CreateEventDTO, {
                onSuccess: onClose,
            });
        }
    };

    const handleDelete = () => {
        if (event) {
            deleteMutation.mutate(event.id, {
                onSuccess: onClose,
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                    <DialogDescription>
                        {event ? 'Update event details.' : 'Fill in the details for your new event.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Event title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-muted/20">
                            <FormLabel className="text-sm font-medium">All Day Event</FormLabel>
                            <FormField
                                control={form.control}
                                name="is_allday"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="event">Event</SelectItem>
                                            <SelectItem value="task">Task</SelectItem>
                                            <SelectItem value="milestone">Milestone</SelectItem>
                                            <SelectItem value="holiday">Holiday</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Physical location or link" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional details..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4 flex justify-between sm:justify-between items-center w-full">
                            {event ? (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    Delete
                                </Button>
                            ) : <div />}
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {event ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
