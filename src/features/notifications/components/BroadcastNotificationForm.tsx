import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Send, Users, History, Trash2, ExternalLink, Megaphone } from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { getUsers } from '@/features/users/api'
import { sendBroadcastNotification, getBroadcastHistory, deleteBroadcast } from '../api/broadcast'

const broadcastSchema = z.object({
    title: z.string().min(1, 'Judul wajib diisi').max(255),
    message: z.string().min(1, 'Pesan wajib diisi'),
    type: z.enum(['all', 'single', 'multiple']),
    user_ids: z.array(z.number()).optional(),
    notification_type: z.enum(['info', 'success', 'warning', 'error']),
    url: z.string().optional(),
    is_banner: z.boolean(),
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
    const [page, setPage] = useState(1)
    const queryClient = useQueryClient()

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
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.email.toLowerCase().includes(searchUser.toLowerCase())
    )

    const { data: historyData, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['broadcast-history', page],
        queryFn: () => getBroadcastHistory(page),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBroadcast(id),
        onSuccess: () => {
            toast.success('Broadcast berhasil dihapus')
            queryClient.invalidateQueries({ queryKey: ['broadcast-history'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menghapus broadcast')
        }
    })

    const onSubmit = async (values: BroadcastFormValues) => {
        setIsSubmitting(true)
        try {
            await sendBroadcastNotification(values)
            toast.success('Notifikasi berhasil dikirim')
            queryClient.invalidateQueries({ queryKey: ['broadcast-history'] })
            form.reset({
                title: '',
                message: '',
                type: 'all',
                user_ids: [],
                notification_type: 'info',
                url: '',
                is_banner: false,
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengirim notifikasi')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="create" className="gap-2">
                    <Send className="h-4 w-4" />
                    Kirim Broadcast
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    Riwayat Broadcast
                </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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

                                    <FormField
                                        control={form.control}
                                        name="is_banner"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 h-11 bg-white dark:bg-slate-950">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Banner Notification
                                                    </FormLabel>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Tampilkan sebagai popup saat user buka dashboard.
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
            </TabsContent>

            <TabsContent value="history">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <History className="h-6 w-6 text-primary" />
                            Riwayat Broadcast
                        </CardTitle>
                        <CardDescription>
                            Daftar notifikasi broadcast yang telah dikirim. Menghapus broadcast juga akan menghapus notifikasi dari inbox user.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="rounded-md border bg-white dark:bg-slate-950">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Konten</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Banner</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingHistory ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : historyData?.history?.data?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-xs whitespace-nowrap">
                                                {format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: localeId })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 max-w-[300px]">
                                                    <span className="font-bold text-sm truncate">{item.title}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">{item.message}</span>
                                                    {item.url && (
                                                        <span className="text-[10px] text-blue-500 flex items-center gap-1">
                                                            <ExternalLink className="h-3 w-3" />
                                                            {item.url}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="w-fit text-[10px] capitalize">
                                                        {item.type === 'all' ? 'Semua User' : item.type}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {item.recipient_count} Penerima
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.is_banner ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px]">
                                                        Ya
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground">Tidak</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus Broadcast?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini akan menghapus riwayat broadcast dan menarik kembali notifikasi dari inbox seluruh penerima yang belum membacanya.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => deleteMutation.mutate(item.id)}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {historyData?.history?.data?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Megaphone className="h-8 w-8 opacity-20" />
                                                    <p>Belum ada riwayat broadcast.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {historyData?.history && historyData.history.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4 px-2">
                                <div className="text-xs text-muted-foreground">
                                    Halaman {historyData.history.current_page} dari {historyData.history.last_page}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={historyData.history.current_page === 1}
                                        className="h-8 text-xs"
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(historyData.history.last_page, p + 1))}
                                        disabled={historyData.history.current_page === historyData.history.last_page}
                                        className="h-8 text-xs"
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
