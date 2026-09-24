import { useCallback, useEffect, useState } from "react";

import { createFileRoute, Link } from "@tanstack/react-router";

import {
  ArrowRight,
  Briefcase,
  Building2,
  FileCheck,
  HardHat,
  LayoutDashboard,
  PiggyBank,
  RotateCw,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ApiError,
  type ExecutiveProgressData,
  getDashboardStats,
  getExecutiveProgress,
  getKecamatanList,
  type KecamatanItem,
  type KegiatanStats,
} from "@/lib/api/dashboard-api";

export const Route = createFileRoute("/(main)/dashboard/default")({
  component: HomePage,
});

function formatRupiah(value: number): string {
  if (!value) return "Rp 0";
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function HomePage() {
  const [tahun, setTahun] = useState<string>(String(new Date().getFullYear()));
  const [selectedKecamatan, setSelectedKecamatan] = useState<string[]>([]);
  const [kecamatanList, setKecamatanList] = useState<KecamatanItem[]>([]);
  const [kegiatanStats, setKegiatanStats] = useState<KegiatanStats | null>(null);
  const [execProgress, setExecProgress] = useState<ExecutiveProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getKecamatanList()
      .then((data) => setKecamatanList(data))
      .catch((err: unknown) => console.error("Gagal memuat daftar kecamatan", err));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kStats, eProg] = await Promise.all([
        getDashboardStats(tahun, selectedKecamatan),
        getExecutiveProgress(tahun, selectedKecamatan),
      ]);
      setKegiatanStats(kStats);
      setExecProgress(eProg);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Sesi login berakhir. Silakan muat ulang atau login kembali.");
      } else {
        setError("Gagal memuat data ringkasan eksekutif.");
      }
      setKegiatanStats(null);
      setExecProgress(null);
    } finally {
      setLoading(false);
    }
  }, [tahun, selectedKecamatan]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const availableYears = kegiatanStats?.availableYears ?? [new Date().getFullYear()];

  const totalPagu = kegiatanStats?.totalPaguPekerjaan || 0;
  const totalNilaiKontrak = kegiatanStats?.totalNilaiKontrak || 0;
  const totalRealisasiSp2d = execProgress?.totals?.keuangan_total || 0;
  const totalPekerjaan = kegiatanStats?.totalPekerjaan || 0;
  const pekerjaanBerkontrak = kegiatanStats?.pekerjaanBerkontrak || 0;

  const pctSp2dDariPagu = totalPagu > 0 ? ((totalRealisasiSp2d / totalPagu) * 100).toFixed(1) : "0";

  // Comparison trend data (Fisik % vs Keuangan % per bulan)
  let runningKeuangan = 0;
  let runningFisik = 0;

  const comparisonData = execProgress?.monthly_trend?.length
    ? execProgress.monthly_trend.map((t) => {
        runningKeuangan += t.keuangan_sum ?? 0;
        runningFisik = Math.max(runningFisik, t.fisik_avg ?? 0);
        const pctKeuangan = totalPagu > 0 ? Number(((runningKeuangan / totalPagu) * 100).toFixed(1)) : 0;

        return {
          month: t.month,
          fisik: Number(runningFisik.toFixed(1)),
          keuangan: pctKeuangan,
        };
      })
    : [];

  const latestTrend = comparisonData.length ? comparisonData[comparisonData.length - 1] : null;

  const trendConfig: ChartConfig = {
    fisik: {
      label: "Fisik Realisasi (%)",
      color: "var(--chart-1)",
    },
    keuangan: {
      label: "Keuangan SP2D (%)",
      color: "var(--chart-3)",
    },
  };

  const topSubKegiatan = (kegiatanStats?.subKegiatanStats ?? [])
    .slice(0, 5)
    .map((item) => ({
      name: item.name.length > 20 ? `${item.name.slice(0, 20)}…` : item.name,
      fullName: item.name,
      pagu: Number((item.paguM / 1000).toFixed(2)),
      sp2d: Number((item.sp2dTotal / 1_000_000_000).toFixed(2)),
    }));

  return (
    <div className="flex flex-col gap-6">
      {/* Executive Hero Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-primary" />
            <h1 className="font-semibold text-2xl tracking-tight">Ringkasan Eksekutif</h1>
            <Badge variant="secondary">TA {tahun}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Ikhtisar alokasi anggaran, realisasi keuangan SP2D, dan progres fisik pekerjaan fisik/konsultan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={tahun} onValueChange={(v) => v && setTahun(v)}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  TA {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" onClick={fetchData} disabled={loading} className="gap-1.5 h-9">
            <RotateCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Pekerjaan & Pagu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Pekerjaan & Pagu</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : `${totalPekerjaan} Paket`}
            </span>
            <p className="text-muted-foreground text-xs">
              Pagu Total: <span className="font-medium text-foreground">{loading ? "…" : formatRupiah(totalPagu)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Nilai Kontrak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Nilai Kontrak Terikat</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : formatRupiah(totalNilaiKontrak)}
            </span>
            <p className="text-muted-foreground text-xs">
              {loading ? "…" : `${pekerjaanBerkontrak} dari ${totalPekerjaan} paket berkontrak`}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Realisasi SP2D */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Realisasi SP2D Keuangan</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                {loading ? "…" : formatRupiah(totalRealisasiSp2d)}
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {loading ? "…" : `${pctSp2dDariPagu}% Pagu`}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Total pencairan SP2D TA {tahun}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Progres Fisik Estimasi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Rata-rata Progres Fisik</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <HardHat className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : latestTrend ? `${latestTrend.fisik}%` : "—"}
            </span>
            <Badge variant="outline" className="w-fit bg-purple-500/10 text-purple-700 dark:text-purple-300">
              Fisik Lapangan
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/dashboard/pekerjaan" className="group">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold group-hover:text-primary">
                Pekerjaan & Program
              </CardTitle>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Lihat sebaran alokasi pagu kecamatan, progres per sub kegiatan, dan rincian paket pekerjaan
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/finance" className="group">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold group-hover:text-primary">
                Keuangan (SP2D)
              </CardTitle>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pantau realisasi serapan anggaran SP2D, nilai kontrak terikat, dan sisa pagu efisiensi
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/crm" className="group">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold group-hover:text-primary">
                Progres Fisik (Estimasi)
              </CardTitle>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analisis kurva rencana vs realisasi fisik, deviasi proyek, dan rincian paket fisik & konsultan
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Comparison Line Chart: Fisik % vs Keuangan % */}
        <Card>
          <CardHeader>
            <CardTitle>Keselarasan Fisik vs Keuangan (%)</CardTitle>
            <CardDescription>Perbandingan progres fisik (%) dan serapan keuangan SP2D (%) per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : comparisonData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center text-muted-foreground text-sm">
                Belum ada data tren keselarasan.
              </div>
            ) : (
              <ChartContainer config={trendConfig} className="w-full" style={{ height: 320 }}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(val) => `${Number(val).toFixed(1)}%`}
                      />
                    }
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="fisik"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Progres Fisik (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="keuangan"
                    stroke="var(--chart-3)"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Serapan Keuangan SP2D (%)"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Top 5 Sub Kegiatan */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Sub Kegiatan Anggaran Terbesar</CardTitle>
            <CardDescription>Alokasi pagu (Miliar Rp) dan realisasi SP2D (Miliar Rp)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : topSubKegiatan.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center text-muted-foreground text-sm">
                Belum ada data sub kegiatan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topSubKegiatan} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} M`} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={120} />
                  <ChartTooltip
                    formatter={(val, name, item) => [
                      formatRupiah(Number(val) * 1_000_000_000),
                      item?.dataKey === "pagu" ? "Pagu Anggaran" : "Realisasi SP2D",
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="pagu" fill="var(--chart-1)" name="Pagu (Miliar Rp)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="sp2d" fill="var(--chart-3)" name="Realisasi SP2D (Miliar Rp)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
