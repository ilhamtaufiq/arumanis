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
import type { CalendarEvent, CreateEventDTO, CalendarAttachment } from '../types';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ImagePlus, X, FileText, Paperclip, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    is_allday: z.boolean(),
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required'),
    category: z.enum(['event', 'task', 'milestone', 'holiday']),
    location: z.string().optional(),
    description: z.string().optional(),
    attachments: z.array(z.any()).optional(),
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
            attachments: [],
        },
    });

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachments = form.watch('attachments') || [];

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
                attachments: event.attachments || [],
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
                attachments: [],
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
                attachments: [],
            });
        }
    }, [event, selectedDate, form, isOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newAttachments: CalendarAttachment[] = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: URL.createObjectURL(file), // Local URL for preview
            type: file.type,
            size: file.size,
        }));

        form.setValue('attachments', [...attachments, ...newAttachments], {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true
        });

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (id: string | number) => {
        form.setValue('attachments', attachments.filter((a: CalendarAttachment) => a.id !== id), {
            shouldDirty: true
        });
    };

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
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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

                        <FormField
                            control={form.control}
                            name="attachments"
                            render={() => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="flex items-center gap-2">
                                            <Paperclip className="h-4 w-4" />
                                            Dokumentasi & Foto
                                        </FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <ImagePlus className="h-4 w-4 mr-2" />
                                            )}
                                            Tambah Foto
                                        </Button>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,application/pdf"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    <div className="mt-2">
                                        {attachments.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                {attachments.map((file: CalendarAttachment) => (
                                                    <div
                                                        key={file.id}
                                                        className="group relative rounded-lg border bg-muted/30 p-2 transition-all hover:bg-muted/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {file.type.startsWith('image/') ? (
                                                                <div className="h-12 w-12 rounded-md overflow-hidden bg-background border flex-shrink-0">
                                                                    <img
                                                                        src={file.url}
                                                                        alt={file.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-md bg-background border flex items-center justify-center flex-shrink-0">
                                                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{file.name}</p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Dokumen'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeAttachment(file.id)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <ImagePlus className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                                <p className="text-sm text-muted-foreground">Belum ada foto atau dokumen</p>
                                                <p className="text-xs text-muted-foreground/60 mt-1">Klik untuk mengunggah</p>
                                            </div>
                                        )}
                                    </div>
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
