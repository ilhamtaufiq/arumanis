import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/dashboard';
import type { KegiatanStats } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
// import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Line, LineChart, LabelList } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart";

export default function Dashboard() {
    const [stats, setStats] = useState<KegiatanStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const fetchStats = async (year?: string) => {
        try {
            setLoading(true);
            const data = await getDashboardStats(year === 'all' ? undefined : year);
            setStats(data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(selectedYear);
    }, [selectedYear]);

    if (loading && !stats) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-destructive">{error || 'Data tidak tersedia'}</p>
                </div>
            </div>
        );
    }

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const chartConfig = {
        value: {
            label: "Jumlah",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

    const pieChartConfig = {
        value: {
            label: "Jumlah",
        },
        ...(stats.kegiatanPerSumberDana || []).reduce((acc, item, index) => ({
            ...acc,
            [item.name]: {
                label: item.name,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
            }
        }), {})
    } satisfies ChartConfig;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Ringkasan data kegiatan dan anggaran
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tahun</SelectItem>
                            {stats.availableYears?.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* <Link
                        to="/kegiatan"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Lihat Semua Kegiatan
                    </Link> */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Kegiatan
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalKegiatan}</div>
                        <p className="text-xs text-muted-foreground">
                            {selectedYear !== 'all' ? `Tahun ${selectedYear}` : 'Semua Tahun'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pagu Anggaran
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(stats.totalPagu)}</div>
                        <p className="text-xs text-muted-foreground">
                            Akumulasi seluruh kegiatan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rata-rata Pagu
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatRupiah(stats.totalKegiatan > 0 ? stats.totalPagu / stats.totalKegiatan : 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per kegiatan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pekerjaan
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPekerjaan}</div>
                        <p className="text-xs text-muted-foreground">
                            Paket pekerjaan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pagu Pekerjaan
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(stats.totalPaguPekerjaan)}</div>
                        <p className="text-xs text-muted-foreground">
                            Akumulasi pekerjaan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Kontrak
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalKontrak}</div>
                        <p className="text-xs text-muted-foreground">
                            Paket kontrak
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Nilai Kontrak
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(stats.totalNilaiKontrak)}</div>
                        <p className="text-xs text-muted-foreground">
                            Akumulasi kontrak
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Kegiatan per Tahun Anggaran</CardTitle>
                        <CardDescription>Distribusi jumlah kegiatan berdasarkan tahun</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={stats.kegiatanPerTahun || []}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                                    <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kegiatan per Sumber Dana</CardTitle>
                        <CardDescription>Distribusi kegiatan berdasarkan sumber dana</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                    data={(stats.kegiatanPerSumberDana || []).map((item, index) => ({
                                        ...item,
                                        fill: `hsl(var(--chart-${(index % 5) + 1}))`
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                />
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trend Pagu Anggaran</CardTitle>
                    <CardDescription>Perkembangan total pagu anggaran per tahun (dalam jutaan rupiah)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <LineChart accessibilityLayer data={stats.paguPerTahun || []}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--color-value)"
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: "var(--color-value)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Pekerjaan Charts Section */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Statistik Pekerjaan</h2>
                    <p className="text-muted-foreground">
                        Distribusi paket pekerjaan berdasarkan wilayah
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pekerjaan per Kecamatan</CardTitle>
                            <CardDescription>Jumlah paket pekerjaan di setiap kecamatan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                <BarChart accessibilityLayer data={stats.pekerjaanPerKecamatan || []}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4}>
                                        <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 Desa</CardTitle>
                            <CardDescription>Desa dengan pekerjaan terbanyak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                <BarChart accessibilityLayer data={stats.pekerjaanPerDesa || []}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={4}>
                                        <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pagu Pekerjaan per Kecamatan</CardTitle>
                        <CardDescription>Total pagu pekerjaan di setiap kecamatan (dalam jutaan rupiah)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={stats.paguPekerjaanPerKecamatan || []}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={4}>
                                    <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Kontrak Charts Section */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Statistik Kontrak</h2>
                    <p className="text-muted-foreground">
                        Distribusi kontrak berdasarkan penyedia
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kontrak per Penyedia</CardTitle>
                            <CardDescription>Top 10 penyedia dengan kontrak terbanyak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                <BarChart accessibilityLayer data={stats.kontrakPerPenyedia || []}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={4}>
                                        <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Nilai Kontrak per Penyedia</CardTitle>
                            <CardDescription>Top 10 penyedia berdasarkan total nilai kontrak (dalam jutaan rupiah)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                                <BarChart accessibilityLayer data={stats.nilaiKontrakPerPenyedia || []}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4}>
                                        <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Output Charts Section */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Statistik Output</h2>
                    <p className="text-muted-foreground">
                        Capaian output fisik pekerjaan
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Output
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalOutput}</div>
                            <p className="text-xs text-muted-foreground">
                                Item output fisik
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Output per Satuan</CardTitle>
                        <CardDescription>Distribusi output berdasarkan satuan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={stats.outputPerSatuan || []}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4}>
                                    <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Penerima Charts Section */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Statistik Penerima Manfaat</h2>
                    <p className="text-muted-foreground">
                        Data penerima manfaat program
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Penerima
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPenerima}</div>
                            <p className="text-xs text-muted-foreground">
                                Kepala Keluarga (KK)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Jiwa
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalJiwa}</div>
                            <p className="text-xs text-muted-foreground">
                                Jumlah jiwa terlayani
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Komunal vs Individu</CardTitle>
                            <CardDescription>Distribusi jenis penerima manfaat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={(stats.penerimaKomunalVsIndividu || []).map((item, index) => ({
                                            ...item,
                                            fill: `hsl(var(--chart-${(index % 5) + 1}))`
                                        }))}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                    />
                                    <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
