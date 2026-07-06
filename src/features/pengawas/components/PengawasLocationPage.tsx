import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { MapPin, RefreshCw, Users } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatKoordinatDisplay } from '@/lib/koordinat-utils'
import { useOnlineUsers } from '@/features/dashboard/hooks/use-user-presence'
import {
    countPengawasPresenceOnline,
    mapPengawasPresenceToLocationPoints,
} from '../lib/presence-location'
import { PengawasLocationMap } from './PengawasLocationMap'

function formatDateTime(value?: string | null) {
    if (!value) return '-'
    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return '-'
    }
}

function StatCard({
    label,
    value,
    hint,
    loading,
}: {
    label: string
    value: string
    hint: string
    loading?: boolean
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                    {loading ? <Skeleton className="h-8 w-16" /> : value}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
        </Card>
    )
}

export default function PengawasLocationPage() {
    const presenceQuery = useOnlineUsers()
    const users = presenceQuery.users
    const onlineWindowMinutes = presenceQuery.onlineWindowMinutes

    const counts = useMemo(() => countPengawasPresenceOnline(users), [users])
    const locationPoints = useMemo(() => mapPengawasPresenceToLocationPoints(users), [users])
    const onlineWithoutKoordinat = useMemo(
        () =>
            users.filter(
                (user) =>
                    user.app === 'pengawasan' &&
                    !locationPoints.some((point) => point.id === user.id),
            ),
        [locationPoints, users],
    )

    const isLoading = presenceQuery.isLoading
    const isError = presenceQuery.isError

    return (
        <>
            <Header fixed>
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h1 className="text-lg font-semibold">Lokasi Pengawas</h1>
                </div>
            </Header>

            <Main className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Peta lokasi pengawas aktif</h2>
                        <p className="text-sm text-muted-foreground">
                            Koordinat terakhir dari aplikasi mobile pengawasan (refresh otomatis ±30 detik, jendela
                            online {onlineWindowMinutes} menit).
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={presenceQuery.isFetching}
                        onClick={() => void presenceQuery.refetch()}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${presenceQuery.isFetching ? 'animate-spin' : ''}`} />
                        Muat ulang
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Pengawas online"
                        value={String(counts.online)}
                        hint="Aplikasi pengawasan aktif"
                        loading={isLoading}
                    />
                    <StatCard
                        label="Dengan koordinat"
                        value={String(counts.withKoordinat)}
                        hint="Titik tampil di peta"
                        loading={isLoading}
                    />
                    <StatCard
                        label="Tanpa koordinat"
                        value={String(counts.withoutKoordinat)}
                        hint="Belum mengirim GPS dari mobile"
                        loading={isLoading}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Peta lokasi</CardTitle>
                        <CardDescription>
                            Titik koordinat terakhir yang dikirim pengawas dari aplikasi mobile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[min(62vh,520px)] min-h-[360px] w-full rounded-2xl" />
                        ) : isError ? (
                            <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                                Gagal memuat data presence.{' '}
                                <button
                                    type="button"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                    onClick={() => void presenceQuery.refetch()}
                                >
                                    Coba lagi
                                </button>
                            </div>
                        ) : locationPoints.length ? (
                            <PengawasLocationMap points={locationPoints} />
                        ) : (
                            <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                                Belum ada koordinat pengawas. Aktifkan pelacakan GPS latar belakang di aplikasi mobile,
                                lalu tunggu heartbeat berikutnya.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {locationPoints.length ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar pengawas di peta</CardTitle>
                            <CardDescription>Klik marker di peta untuk detail singkat.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Koordinat</TableHead>
                                        <TableHead>Terakhir lokasi</TableHead>
                                        <TableHead>Terakhir online</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locationPoints.map((point) => (
                                        <TableRow key={point.id}>
                                            <TableCell>
                                                <div className="font-medium">{point.name}</div>
                                                <div className="text-xs text-muted-foreground">{point.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{formatKoordinatDisplay(point.koordinat)}</Badge>
                                            </TableCell>
                                            <TableCell>{formatDateTime(point.koordinat_at)}</TableCell>
                                            <TableCell>{formatDateTime(point.last_seen_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : null}

                {onlineWithoutKoordinat.length ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Online tanpa koordinat
                            </CardTitle>
                            <CardDescription>
                                Pengawas terdeteksi online, tetapi belum mengirim titik GPS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {onlineWithoutKoordinat.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-amber-500/40 text-amber-700">
                                            Tanpa koordinat
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(user.last_seen_at), {
                                                addSuffix: true,
                                                locale: localeId,
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : null}
            </Main>
        </>
    )
}