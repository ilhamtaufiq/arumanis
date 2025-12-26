import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Send, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { getUsers } from '@/features/users/api'
import { sendBroadcastNotification } from '../api/broadcast'

const broadcastSchema = z.object({
    title: z.string().min(1, 'Judul wajib diisi').max(255),
    message: z.string().min(1, 'Pesan wajib diisi'),
    type: z.enum(['all', 'single', 'multiple']),
    user_ids: z.array(z.number()).optional(),
    notification_type: z.enum(['info', 'success', 'warning', 'error']),
    url: z.string().optional(),
}).refine((data) => {
    if (data.type !== 'all' && (!data.user_ids || data.user_ids.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Pilih setidaknya satu user",
    path: ["user_ids"],
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>

export default function BroadcastNotificationForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchUser, setSearchUser] = useState('')

    const form = useForm<BroadcastFormValues>({
        resolver: zodResolver(broadcastSchema),
        defaultValues: {
            title: '',
            message: '',
            type: 'all',
            user_ids: [],
            notification_type: 'info',
            url: '',
        },
    })

    const watchType = form.watch('type')

    const { data: userData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(),
    })

    const users = userData?.data || []
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.email.toLowerCase().includes(searchUser.toLowerCase())
    )

    const onSubmit = async (values: BroadcastFormValues) => {
        setIsSubmitting(true)
        try {
            await sendBroadcastNotification(values)
            toast.success('Notifikasi berhasil dikirim')
            form.reset({
                title: '',
                message: '',
                type: 'all',
                user_ids: [],
                notification_type: 'info',
                url: '',
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengirim notifikasi')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Send className="h-6 w-6 text-primary" />
                    Kirim Notifikasi Broadcast
                </CardTitle>
                <CardDescription>
                    Kirim pesan atau pengumuman ke seluruh user atau user tertentu di aplikasi.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Judul Notifikasi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Pemeliharaan Sistem" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notification_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipe Visual</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih tipe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="success">Success</SelectItem>
                                                <SelectItem value="warning">Warning</SelectItem>
                                                <SelectItem value="error">Error</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Penerima</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih target" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="all">Seluruh User</SelectItem>
                                                <SelectItem value="single">Single User</SelectItem>
                                                <SelectItem value="multiple">Beberapa User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pesan</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tulis pesan lengkap di sini..."
                                            className="min-h-[120px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Tujuan (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="/pekerjaan, /tiket, dsb." {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        User akan diarahkan ke link ini saat mengklik notifikasi.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchType !== 'all' && (
                            <div className="space-y-3">
                                <FormLabel className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Pilih User Penerima
                                </FormLabel>
                                <Input
                                    placeholder="Cari user (nama/email)..."
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    className="mb-2"
                                />
                                <ScrollArea className="h-72 w-full rounded-md border p-4 bg-white dark:bg-slate-950">
                                    {isLoadingUsers ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredUsers.map((user) => (
                                                <FormField
                                                    key={user.id}
                                                    control={form.control}
                                                    name="user_ids"
                                                    render={({ field }) => {
                                                        const isChecked = field.value?.includes(user.id)
                                                        return (
                                                            <div className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => {
                                                                            if (watchType === 'single') {
                                                                                field.onChange(checked ? [user.id] : [])
                                                                            } else {
                                                                                return checked
                                                                                    ? field.onChange([...(field.value || []), user.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== user.id
                                                                                        )
                                                                                    )
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel className="text-sm font-medium cursor-pointer">
                                                                        {user.name}
                                                                    </FormLabel>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {user.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <p className="text-center text-sm text-muted-foreground py-4">
                                                    User tidak ditemukan.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </ScrollArea>
                                <FormMessage />
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Kirim Sekarang
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
