import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useOnlineUsers } from '../hooks/use-user-presence'

export function OnlineUsersPanel() {
    const { users, onlineCount, onlineWindowMinutes, isLoading, isError, currentUserId } = useOnlineUsers()

    if (isLoading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Pengguna Online
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="px-0 py-6 text-center text-sm text-muted-foreground">
                    Gagal memuat daftar pengguna online.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Pengguna Online
                    </CardTitle>
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        {onlineCount} aktif
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    Aktif dalam {onlineWindowMinutes} menit terakhir
                </p>
            </CardHeader>
            <CardContent className="px-0">
                {users.length > 0 ? (
                    <div className="space-y-2">
                        {users.map((user) => {
                            const isCurrentUser = user.id === currentUserId

                            return (
                                <div
                                    key={user.id}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors',
                                        isCurrentUser && 'border-primary/15 bg-primary/5'
                                    )}
                                >
                                    <div className="relative">
                                        <UserAvatar
                                            id={user.id}
                                            name={user.name}
                                            email={user.email}
                                            avatar={user.avatar}
                                            gender={user.gender}
                                            className="h-10 w-10"
                                        />
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium leading-none">
                                            {user.name}
                                            {isCurrentUser ? (
                                                <span className="ml-1 text-xs font-normal text-muted-foreground">(Anda)</span>
                                            ) : null}
                                            {user.app === 'pengawasan' ? (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 align-middle border-violet-500/30 bg-violet-500/10 px-1.5 py-0 text-[10px] font-semibold text-violet-700 dark:text-violet-300"
                                                >
                                                    Pengawasan
                                                </Badge>
                                            ) : null}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            {user.app === 'pengawasan' ? 'Aplikasi Pengawasan · ' : null}
                                            {formatDistanceToNow(new Date(user.last_seen_at), {
                                                addSuffix: true,
                                                locale: id,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-muted/50 bg-muted/5 px-4 py-8 text-center text-sm text-muted-foreground">
                        Belum ada pengguna lain yang terdeteksi online.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}