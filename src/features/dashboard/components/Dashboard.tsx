import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    Briefcase,
    FileText,
    Package,
    Users,
    Wallet,
    TrendingUp,
} from 'lucide-react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { Search } from '@/components/search'
import { getDashboardStats } from '../api/dashboard'
import type { ChartData } from '../types'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { PengawasDashboard } from '@/features/user-pekerjaan/components/PengawasDashboard'

// Chart colors
const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
]

// Format currency
function formatCurrency(value: number): string {
    if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)} M`
    }
    if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(1)} Jt`
    }
    return `Rp ${value.toLocaleString('id-ID')}`
}

// Format number
function formatNumber(value: number): string {
    return value.toLocaleString('id-ID')
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    description,
    isLoading,
    variant = 'default',
}: {
    title: string
    value: string
    icon: React.ElementType
    description?: string
    isLoading?: boolean
    variant?: 'default' | 'success' | 'warning' | 'info'
}) {
    const variantStyles = {
        default: 'from-slate-500/10 via-slate-500/5 to-transparent border-slate-500/20',
        success: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20',
        warning: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20',
        info: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20',
    }

    const iconStyles = {
        default: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    }

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br ${variantStyles[variant]} border`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${iconStyles[variant]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

// Bar Chart Component
function DashboardBarChart({
    title,
    description,
    data,
    isLoading,
    dataKey = 'value',
    nameKey = 'name',
    layout = 'vertical',
    height = 350,
}: {
    title: string
    description?: string
    data: ChartData[]
    isLoading?: boolean
    dataKey?: string
    nameKey?: string
    layout?: 'vertical' | 'horizontal'
    height?: number
}) {
    const chartConfig: ChartConfig = {
        [dataKey]: {
            label: title,
            color: 'var(--chart-1)',
        },
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">Tidak ada data</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                    {layout === 'horizontal' ? (
                        <BarChart data={data} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey={nameKey}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                width={60}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey={dataKey}
                                fill="var(--chart-1)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    ) : (
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                            <YAxis
                                dataKey={nameKey}
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                width={120}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey={dataKey}
                                fill="var(--chart-1)"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

// Pie Chart Component
function DashboardPieChart({
    title,
    description,
    data,
    isLoading,
}: {
    title: string
    description?: string
    data: ChartData[]
    isLoading?: boolean
}) {
    const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: COLORS[index % COLORS.length],
        }
        return acc
    }, {} as ChartConfig)

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">Tidak ada data</p>
                </CardContent>
            </Card>
        )
    }

    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            label={({ name, value }) => `${name}: ${value}`}
                            labelLine={false}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="hsl(var(--background))"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-muted-foreground">
                                {item.name} ({((item.value / total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function Dashboard() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const isAdmin = auth.user?.roles?.includes('admin') ?? false

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        enabled: isAdmin, // Only fetch stats if admin
    })

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export data')
    }

    // Non-admin users see PengawasDashboard
    if (!isAdmin) {
        return <PengawasDashboard />
    }

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <TopNav links={topNav} />
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                </div>
            </Header>

            {/* ===== Main ===== */}
            <Main>
                <div className='mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>
                            {isAdmin ? 'Dashboard' : `Selamat Datang, ${auth.user?.name || 'User'}!`}
                        </h1>
                        <p className='text-muted-foreground'>
                            {isAdmin
                                ? 'Ringkasan data kegiatan dan pekerjaan'
                                : '🚀'}
                        </p>
                    </div>
                    {isAdmin && (
                        <div className='flex items-center gap-3'>
                            <Button onClick={handleExport} variant="outline">
                                Export
                            </Button>
                        </div>
                    )}
                </div>

                {isAdmin && (
                    <>
                        {error && (
                            <Card className="mb-6 border-destructive">
                                <CardContent className="pt-6">
                                    <p className="text-destructive">
                                        Gagal memuat data dashboard. Silakan coba lagi.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stats Cards - Row 1 */}
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
                            <StatCard
                                title="Total Kegiatan"
                                value={formatNumber(stats?.totalKegiatan ?? 0)}
                                icon={Activity}
                                description="Jumlah kegiatan terdaftar"
                                isLoading={isLoading}
                                variant="info"
                            />
                            <StatCard
                                title="Total Pekerjaan"
                                value={formatNumber(stats?.totalPekerjaan ?? 0)}
                                icon={Briefcase}
                                description="Jumlah pekerjaan aktif"
                                isLoading={isLoading}
                                variant="success"
                            />
                            <StatCard
                                title="Total Kontrak"
                                value={formatNumber(stats?.totalKontrak ?? 0)}
                                icon={FileText}
                                description="Kontrak yang terdaftar"
                                isLoading={isLoading}
                                variant="warning"
                            />
                            <StatCard
                                title="Total Output"
                                value={formatNumber(stats?.totalOutput ?? 0)}
                                icon={Package}
                                description="Output pekerjaan"
                                isLoading={isLoading}
                                variant="default"
                            />
                        </div>

                        {/* Stats Cards - Row 2 */}
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
                            <StatCard
                                title="Total Pagu Kegiatan"
                                value={formatCurrency(stats?.totalPagu ?? 0)}
                                icon={Wallet}
                                description="Total anggaran kegiatan"
                                isLoading={isLoading}
                                variant="info"
                            />
                            <StatCard
                                title="Total Pagu Pekerjaan"
                                value={formatCurrency(stats?.totalPaguPekerjaan ?? 0)}
                                icon={Wallet}
                                description="Total anggaran pekerjaan"
                                isLoading={isLoading}
                                variant="success"
                            />
                            <StatCard
                                title="Total Nilai Kontrak"
                                value={formatCurrency(stats?.totalNilaiKontrak ?? 0)}
                                icon={Wallet}
                                description="Nilai seluruh kontrak"
                                isLoading={isLoading}
                                variant="warning"
                            />
                            <StatCard
                                title="Total Penerima"
                                value={formatNumber(stats?.totalPenerima ?? 0)}
                                icon={Users}
                                description={`${formatNumber(stats?.totalJiwa ?? 0)} jiwa`}
                                isLoading={isLoading}
                                variant="default"
                            />
                        </div>

                        {/* Charts Row 1 */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6'>
                            <DashboardBarChart
                                title="Kegiatan per Tahun Anggaran"
                                description="Distribusi kegiatan berdasarkan tahun anggaran"
                                data={stats?.kegiatanPerTahun ?? []}
                                isLoading={isLoading}
                                layout="horizontal"
                            />
                            <DashboardPieChart
                                title="Kegiatan per Sumber Dana"
                                description="Distribusi kegiatan berdasarkan sumber dana"
                                data={stats?.kegiatanPerSumberDana ?? []}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Charts Row 2 */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6'>
                            <DashboardBarChart
                                title="Pagu per Tahun Anggaran"
                                description="Total pagu dalam jutaan rupiah"
                                data={stats?.paguPerTahun ?? []}
                                isLoading={isLoading}
                                layout="horizontal"
                            />
                            <DashboardBarChart
                                title="Pekerjaan per Kecamatan"
                                description="Distribusi pekerjaan berdasarkan kecamatan"
                                data={stats?.pekerjaanPerKecamatan ?? []}
                                isLoading={isLoading}
                                layout="vertical"
                                height={400}
                            />
                        </div>

                        {/* Charts Row 3 */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6'>
                            <DashboardBarChart
                                title="Top 10 Pekerjaan per Desa"
                                description="Desa dengan jumlah pekerjaan terbanyak"
                                data={stats?.pekerjaanPerDesa ?? []}
                                isLoading={isLoading}
                                layout="vertical"
                                height={400}
                            />
                            <DashboardBarChart
                                title="Pagu Pekerjaan per Kecamatan"
                                description="Total pagu dalam jutaan rupiah per kecamatan"
                                data={stats?.paguPekerjaanPerKecamatan ?? []}
                                isLoading={isLoading}
                                layout="vertical"
                                height={400}
                            />
                        </div>

                        {/* Charts Row 4 */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6'>
                            <DashboardBarChart
                                title="Top 10 Kontrak per Penyedia"
                                description="Penyedia dengan jumlah kontrak terbanyak"
                                data={stats?.kontrakPerPenyedia ?? []}
                                isLoading={isLoading}
                                layout="vertical"
                                height={400}
                            />
                            <DashboardBarChart
                                title="Nilai Kontrak per Penyedia"
                                description="Total nilai kontrak dalam jutaan rupiah"
                                data={stats?.nilaiKontrakPerPenyedia ?? []}
                                isLoading={isLoading}
                                layout="vertical"
                                height={400}
                            />
                        </div>

                        {/* Charts Row 5 */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            <DashboardPieChart
                                title="Output per Komponen"
                                description="Distribusi output berdasarkan komponen"
                                data={stats?.outputPerKomponen ?? []}
                                isLoading={isLoading}
                            />
                            <DashboardPieChart
                                title="Penerima Komunal vs Individu"
                                description="Perbandingan tipe penerima manfaat"
                                data={stats?.penerimaKomunalVsIndividu ?? []}
                                isLoading={isLoading}
                            />
                        </div>
                    </>
                )}
            </Main>
        </>
    )
}

const topNav = [
    {
        title: 'Overview',
        href: 'dashboard/overview',
        isActive: true,
        disabled: false,
    },
    {
        title: 'Analytics',
        href: 'dashboard/analytics',
        isActive: false,
        disabled: true,
    },
    {
        title: 'Reports',
        href: 'dashboard/reports',
        isActive: false,
        disabled: true,
    },
]