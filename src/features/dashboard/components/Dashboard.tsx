import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow, isToday } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
    Activity,
    BellRing,
    Briefcase,
    CalendarDays,
    ClipboardList,
    FileText,
    RefreshCw,
    TrendingUp,
    Wallet,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { useEvents } from '@/features/calendar/api'
import { useAuditLogs } from '@/features/calendar/api/audit'
import type { AuditLog } from '@/features/calendar/types/audit'
import { getNotifications } from '@/features/notifications/api/notifications'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getTiketList } from '@/features/tiket/api/tiket'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { getDashboardStats } from '../api/dashboard'
import { formatCurrency, formatNumber } from '../lib/format'
import { DashboardStatCard } from './DashboardStatCard'

function greeting() {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
}

const ACTIVITY_LABELS: Record<string, string> = {
    Foto: 'foto dokumentasi',
    Penerima: 'penerima manfaat',
    Pekerjaan: 'paket pekerjaan',
    Event: 'jadwal kegiatan',
    Berkas: 'berkas dokumen',
    Progress: 'progres pekerjaan',
    Kontrak: 'data kontrak',
    KontrakAddendum: 'adendum kontrak',
    Kegiatan: 'kegiatan',
    Output: 'output pekerjaan',
    Penyedia: 'penyedia',
    Pengawas: 'pengawas',
    Pengelola: 'pengelola',
    Tiket: 'tiket',
    TiketComment: 'komentar tiket',
    Blog: 'artikel',
    BlogComment: 'komentar artikel',
    KegiatanRole: 'peran kegiatan',
    OutputBaru: 'output',
    Desa: 'desa',
    Kecamatan: 'kecamatan',
    User: 'pengguna',
    Sk: 'SK',
    UsulanKegiatan: 'usulan kegiatan',
    DraftPekerjaan: 'draf pekerjaan',
    DocumentRegister: 'register dokumen',
    DocumentType: 'jenis dokumen',
    ChecklistItem: 'item checklist',
    UnitChecklist: 'checklist unit',
    UnitSpam: 'unit SPAM',
    SpamAchievement: 'capaian SPAM',
    SpamBudget: 'anggaran SPAM',
    SpmSanitasi: 'SPM sanitasi',
    PetaPeripaan: 'peta perpipaan',
    PuspenMediaShare: 'media puspen',
    PanduanPage: 'halaman panduan',
    MenuPermission: 'izin menu',
    RoutePermission: 'izin rute',
    SimulationNetwork: 'jaringan simulasi',
    SimulationNetworkVersion: 'versi simulasi',
    SignatureLibrary: 'pustaka tanda tangan',
    ToolPdf: 'perkakas PDF',
    Tag: 'tag',
    AppSetting: 'pengaturan aplikasi',
    UserDriveItem: 'berkas drive',
}

const NAME_KEYS = [
    'nama_paket',
    'nama_kegiatan',
    'nama',
    'name',
    'title',
    'judul',
    'subjek',
    'nomor_kontrak',
    'keterangan',
]

function pickName(values: Record<string, unknown> | null): string | null {
    if (!values) return null
    for (const key of NAME_KEYS) {
        const v = values[key]
        if (typeof v === 'string' && v.trim()) return v.trim()
    }
    return null
}

function activityVerb(type: string, event: AuditLog['event']): string {
    if (event === 'deleted') return 'menghapus'
    if (event === 'updated') return 'memperbarui'
    switch (type) {
        case 'Foto':
        case 'Berkas':
        case 'UserDriveItem':
            return 'mengunggah'
        case 'Penerima':
            return 'mendaftarkan'
        case 'Event':
        case 'TiketComment':
        case 'BlogComment':
        case 'Blog':
            return 'menambahkan'
        default:
            return 'membuat'
    }
}

function describeActivity(log: AuditLog): string {
    const type = log.auditable_type.split('\\').pop() ?? ''
    const label = ACTIVITY_LABELS[type] ?? (type.toLowerCase().replace(/([a-z])([A-Z])/g, '$1 $2') || 'data')
    const name =
        (type === 'Pekerjaan' ? log.pekerjaan?.nama_paket : null) ??
        pickName(log.new_values) ??
        pickName(log.old_values)
    return `${activityVerb(type, log.event)} ${label}${name ? ` ${name}` : ''}`
}

export function Dashboard() {
    const { tahunAnggaran } = useAppSettingsValues()
    const user = useAuthStore((s) => s.auth.user)
    const canViewStats =
        user?.roles?.some((role) => role === 'admin' || role === 'manager') ?? false

    const statsQuery = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        enabled: canViewStats,
        staleTime: 60_000,
    })

    const { data: events } = useEvents()

    const { data: notifData } = useQuery({
        queryKey: ['dashboard-mini', 'notifications'],
        queryFn: () => getNotifications(true),
        staleTime: 30_000,
    })

    const { data: tiketData } = useQuery({
        queryKey: ['dashboard-mini', 'tiket'],
        queryFn: () => getTiketList({ per_page: 5, status: 'open' }),
        staleTime: 30_000,
    })

    const { data: activityData, isLoading: activityLoading } = useAuditLogs({ per_page: 6 })

    const { data: progressData, isLoading: progressLoading } = useQuery({
        queryKey: ['dashboard-mini', 'progress-incomplete', tahunAnggaran],
        queryFn: async () => {
            const res = await getPekerjaan({
                per_page: 50,
                tahun: tahunAnggaran,
                status: 'active',
                summary: true,
            })
            return (res.data ?? [])
                .map((p) => ({
                    id: p.id,
                    nama_paket: p.nama_paket,
                    fisik: Number(p.progress_estimasi_fisik ?? 0),
                    keuangan: Number(p.progress_estimasi_keuangan ?? 0),
                }))
                .filter((p) => p.fisik < 100)
                .sort((a, b) => a.fisik - b.fisik)
                .slice(0, 5)
        },
        staleTime: 60_000,
    })

    const stats = statsQuery.data
    const todayEvents =
        events?.filter((e) => isToday(new Date(e.start))).slice(0, 5) ?? []
    const recentActivity = activityData?.data?.slice(0, 6) ?? []
    const unread = notifData?.notifications?.slice(0, 3) ?? []
    // biome-ignore lint: tiket response shape varies, read defensively
    const tiketList: Array<{ id: number; subjek: string }> = (
        tiketData as unknown as { data?: Array<{ id: number; subjek: string }> }
    )?.data?.slice(0, 3) ?? []

    const todayLabel = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-6">
                    <div className="flex items-start justify-between gap-3">
                        <Heading
                            title={`${greeting()}${user?.name ? `, ${user.name}` : ''}`}
                            description={`${todayLabel} · TA ${tahunAnggaran}`}
                        />
                        {canViewStats ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void statsQuery.refetch()}
                                disabled={statsQuery.isFetching}
                            >
                                <RefreshCw className={statsQuery.isFetching ? 'animate-spin' : ''} />
                                {statsQuery.isFetching ? 'Memuat…' : 'Muat ulang'}
                            </Button>
                        ) : null}
                    </div>

                    {canViewStats ? (
                        <section aria-label="Ringkasan">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <DashboardStatCard
                                    title="Kegiatan"
                                    value={formatNumber(stats?.totalKegiatan ?? 0)}
                                    icon={ClipboardList}
                                    description={`TA ${tahunAnggaran}`}
                                    isLoading={statsQuery.isLoading}
                                    variant="info"
                                    compact
                                />
                                <DashboardStatCard
                                    title="Pekerjaan"
                                    value={formatNumber(stats?.totalPekerjaan ?? 0)}
                                    icon={Briefcase}
                                    description="Paket aktif"
                                    isLoading={statsQuery.isLoading}
                                    variant="primary"
                                    compact
                                />
                                <DashboardStatCard
                                    title="Kontrak"
                                    value={formatNumber(stats?.totalKontrak ?? 0)}
                                    icon={FileText}
                                    description="Kontrak aktif"
                                    isLoading={statsQuery.isLoading}
                                    variant="warning"
                                    compact
                                />
                                <DashboardStatCard
                                    title="Nilai kontrak"
                                    value={formatCurrency(stats?.totalNilaiKontrak ?? 0)}
                                    icon={Wallet}
                                    description="Total nilai kontrak"
                                    isLoading={statsQuery.isLoading}
                                    variant="success"
                                    compact
                                />
                            </div>
                        </section>
                    ) : null}

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5" />
                                        Hari ini
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Total {todayEvents.length} kegiatan
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {todayEvents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>Tidak ada kegiatan hari ini.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <ul className="divide-y">
                                            {todayEvents.map((e) => (
                                                <li key={e.id} className="flex gap-3 py-2.5">
                                                    <span className="w-12 shrink-0 text-sm tabular-nums text-muted-foreground">
                                                        {new Date(e.start).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm">{e.title}</span>
                                                        {e.location ? (
                                                            <span className="block truncate text-xs text-muted-foreground">
                                                                {e.location}
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                                    <Link to="/calendar">Buka kalender →</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <BellRing className="h-5 w-5" />
                                        Perlu perhatian
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Total {unread.length + tiketList.length} items
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {unread.length === 0 && tiketList.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>Tidak ada yang mendesak.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <ul className="divide-y">
                                            {unread.map((n) => (
                                                <li key={n.id} className="py-2.5">
                                                    <p className="truncate text-sm">{n.data.title}</p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {n.data.message}
                                                    </p>
                                                </li>
                                            ))}
                                            {tiketList.map((t) => (
                                                <li key={`tiket-${t.id}`} className="py-2.5">
                                                    <p className="truncate text-sm">{t.subjek}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Tiket #{t.id}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    <Button variant="link" size="sm" className="h-auto p-0 pr-3" asChild>
                                        <Link to="/pekerjaan">Pekerjaan</Link>
                                    </Button>
                                    <Button variant="link" size="sm" className="h-auto p-0 pr-3" asChild>
                                        <Link to="/progress_rekap">Rekap Progress</Link>
                                    </Button>
                                    <Button variant="link" size="sm" className="h-auto p-0 pr-3" asChild>
                                        <Link to="/tiket">Tiket</Link>
                                    </Button>
                                    <Button variant="link" size="sm" className="h-auto p-0" asChild>
                                        <Link to="/map">Peta</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Progress estimasi belum 100%
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Total {(progressData ?? []).length} paket
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {progressLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (progressData ?? []).length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Semua paket sudah 100%.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <ul className="divide-y">
                                        {(progressData ?? []).map((p) => (
                                            <li key={p.id}>
                                                <Link
                                                    to="/pekerjaan/$id"
                                                    params={{ id: String(p.id) }}
                                                    className="flex items-center justify-between gap-3 py-2.5"
                                                >
                                                    <span className="min-w-0 truncate text-sm">
                                                        {p.nama_paket}
                                                    </span>
                                                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                                                        {p.fisik}% · keu {p.keuangan}%
                                                    </Badge>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                                <Link to="/progress_rekap">Buka rekap progress →</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Update terbaru dari pengguna
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Total {recentActivity.length} aktivitas
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activityLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Belum ada aktivitas tercatat.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <ul className="divide-y">
                                        {recentActivity.map((log) => (
                                            <li key={log.id} className="flex items-baseline justify-between gap-3 py-2.5">
                                                <p className="min-w-0 truncate text-sm">
                                                    <span className="font-medium">
                                                        {log.user?.name ?? 'Seseorang'}
                                                    </span>{' '}
                                                    <span className="text-muted-foreground">
                                                        {describeActivity(log)}
                                                    </span>
                                                </p>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(log.created_at), {
                                                        addSuffix: true,
                                                        locale: localeId,
                                                    })}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                                <Link to="/audit-logs">Lihat semua aktivitas →</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Main>
        </>
    )
}
