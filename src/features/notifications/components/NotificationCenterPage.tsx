import { useMemo, useState } from 'react'
import { CheckCheck, History, Inbox } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/shared/SearchInput'
import { ListPagination } from '@/components/shared/ListPagination'
import { useAuthStore } from '@/stores/auth-stores'
import {
    extractNotificationList,
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotificationList,
} from '../hooks/useNotifications'
import { NotificationHero } from './NotificationHero'
import { NotificationList } from './NotificationList'

export default function NotificationCenterPage() {
    const [tab, setTab] = useState<'all' | 'unread'>('all')
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    const { auth } = useAuthStore()
    const isAdmin = auth.user?.roles?.some((role) =>
        typeof role === 'string' ? role === 'admin' : role.name === 'admin'
    )

    const unreadOnly = tab === 'unread'
    const { data, isLoading } = useNotificationList(unreadOnly, page)
    const markRead = useMarkNotificationRead()
    const markAllRead = useMarkAllNotificationsRead()

    const notifications = extractNotificationList(data)
    const unreadCount = data?.unread_count ?? 0
    const pagination = data?.pagination

    const filteredNotifications = useMemo(() => {
        if (!search.trim()) return notifications
        const query = search.toLowerCase()
        return notifications.filter(
            (item) =>
                item.data.title.toLowerCase().includes(query) ||
                item.data.message.toLowerCase().includes(query)
        )
    }, [notifications, search])

    const totalCount = unreadOnly
        ? notifications.length
        : pagination?.total ?? notifications.length

    const handleTabChange = (value: string) => {
        setTab(value as 'all' | 'unread')
        setPage(1)
        setSearch('')
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
                    <p className="text-sm text-muted-foreground">
                        Lihat dan kelola semua notifikasi Anda di satu tempat.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isAdmin ? (
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/notifications/broadcast">
                                <History className="mr-2 h-4 w-4" />
                                Broadcast Admin
                            </Link>
                        </Button>
                    ) : null}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllRead.mutate()}
                        disabled={markAllRead.isPending || unreadCount === 0}
                    >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Tandai Semua Dibaca
                    </Button>
                </div>
            </div>

            <NotificationHero
                totalCount={totalCount}
                unreadCount={unreadCount}
                isLoading={isLoading}
            />

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Inbox className="h-5 w-5 text-primary" />
                            Daftar Notifikasi
                        </CardTitle>
                        <SearchInput
                            defaultValue={search}
                            onSearch={setSearch}
                            placeholder="Cari judul atau pesan..."
                            className="w-full sm:w-72"
                        />
                    </div>

                    <Tabs value={tab} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="all">Semua</TabsTrigger>
                            <TabsTrigger value="unread" className="gap-2">
                                Belum Dibaca
                                {unreadCount > 0 ? (
                                    <Badge className="h-5 min-w-5 px-1.5 text-[10px]">{unreadCount}</Badge>
                                ) : null}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Tabs value={tab}>
                        <TabsContent value="all" className="mt-0 space-y-4">
                            <NotificationList
                                notifications={filteredNotifications}
                                isLoading={isLoading}
                                emptyVariant="all"
                                onMarkRead={(id) => markRead.mutate(id)}
                            />
                            {pagination && pagination.last_page > 1 && !search ? (
                                <ListPagination
                                    page={pagination.current_page}
                                    totalPages={pagination.last_page}
                                    onPageChange={setPage}
                                    meta={{
                                        from: pagination.from,
                                        to: pagination.to,
                                        total: pagination.total,
                                        label: 'notifikasi',
                                    }}
                                />
                            ) : null}
                        </TabsContent>

                        <TabsContent value="unread" className="mt-0">
                            <NotificationList
                                notifications={filteredNotifications}
                                isLoading={isLoading}
                                emptyVariant="unread"
                                onMarkRead={(id) => markRead.mutate(id)}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}