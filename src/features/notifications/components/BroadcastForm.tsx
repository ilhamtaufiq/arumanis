import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
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
import { SearchInput } from '@/components/shared/SearchInput'
import { getUsers } from '@/features/users/api'
import { useSendBroadcast } from '../hooks/useNotifications'

const broadcastSchema = z
    .object({
        title: z.string().min(1, 'Judul wajib diisi').max(255),
        message: z.string().min(1, 'Pesan wajib diisi'),
        type: z.enum(['all', 'single', 'multiple']),
        user_ids: z.array(z.number()).optional(),
        notification_type: z.enum(['info', 'success', 'warning', 'error']),
        url: z.string().optional(),
        is_banner: z.boolean(),
    })
    .refine(
        (data) => {
            if (data.type !== 'all' && (!data.user_ids || data.user_ids.length === 0)) {
                return false
            }
            return true
        },
        {
            message: 'Pilih setidaknya satu user',
            path: ['user_ids'],
        }
    )

type BroadcastFormValues = z.infer<typeof broadcastSchema>

export function BroadcastForm() {
    const [searchUser, setSearchUser] = useState('')
    const sendBroadcast = useSendBroadcast()

    const form = useForm<BroadcastFormValues>({
        resolver: zodResolver(broadcastSchema),
        defaultValues: {
            title: '',
            message: '',
            type: 'all',
            user_ids: [],
            notification_type: 'info',
            url: '',
            is_banner: false,
        },
    })

    const watchType = form.watch('type')

    const { data: userData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(),
    })

    const users = userData?.data || []
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
            user.email.toLowerCase().includes(searchUser.toLowerCase())
    )

    const onSubmit = async (values: BroadcastFormValues) => {
        await sendBroadcast.mutateAsync(values)
        form.reset({
            title: '',
            message: '',
            type: 'all',
            user_ids: [],
            notification_type: 'info',
            url: '',
            is_banner: false,
        })
        setSearchUser('')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Send className="h-5 w-5 text-primary" />
                    Form Broadcast
                </CardTitle>
                <CardDescription>
                    Isi detail notifikasi dan pilih target penerima sebelum mengirim.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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

                        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
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
                                            User diarahkan ke link ini saat mengklik notifikasi.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_banner"
                                render={({ field }) => (
                                    <FormItem className="flex h-auto min-h-11 flex-row items-center space-x-3 space-y-0 rounded-xl border bg-muted/20 p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Banner Notification</FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                Tampilkan sebagai popup saat user membuka dashboard.
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {watchType !== 'all' ? (
                            <div className="space-y-3">
                                <FormLabel className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Pilih User Penerima
                                </FormLabel>
                                <SearchInput
                                    defaultValue={searchUser}
                                    onSearch={setSearchUser}
                                    placeholder="Cari user (nama/email)..."
                                />
                                <ScrollArea className="h-72 w-full rounded-xl border bg-background p-4">
                                    {isLoadingUsers ? (
                                        <div className="flex h-full items-center justify-center">
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
                                                                                field.onChange(
                                                                                    checked ? [user.id] : []
                                                                                )
                                                                            } else {
                                                                                return checked
                                                                                    ? field.onChange([
                                                                                          ...(field.value || []),
                                                                                          user.id,
                                                                                      ])
                                                                                    : field.onChange(
                                                                                          field.value?.filter(
                                                                                              (value) =>
                                                                                                  value !== user.id
                                                                                          )
                                                                                      )
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel className="cursor-pointer text-sm font-medium">
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
                                            {filteredUsers.length === 0 ? (
                                                <p className="py-4 text-center text-sm text-muted-foreground">
                                                    User tidak ditemukan.
                                                </p>
                                            ) : null}
                                        </div>
                                    )}
                                </ScrollArea>
                                <FormMessage />
                            </div>
                        ) : null}

                        <Button
                            type="submit"
                            className="h-11 w-full"
                            disabled={sendBroadcast.isPending}
                        >
                            {sendBroadcast.isPending ? (
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