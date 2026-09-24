import { useCallback, useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  HardHat,
  RotateCw,
  TrendingDown,
  TrendingUp,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
  type AnalyticsStats,
  ApiError,
  type ExecutiveProgressData,
  getAnalyticsStats,
  getDashboardStats,
  getExecutiveProgress,
  getKecamatanList,
  type KecamatanItem,
  type KegiatanStats,
} from "@/lib/api/dashboard-api";

export const Route = createFileRoute("/(main)/dashboard/crm")({
  component: FisikDashboardPage,
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

function FisikDashboardPage() {
  const [tahun, setTahun] = useState<string>(String(new Date().getFullYear()));
  const [selectedKecamatan, setSelectedKecamatan] = useState<string[]>([]);
  const [kecamatanList, setKecamatanList] = useState<KecamatanItem[]>([]);
  const [kegiatanStats, setKegiatanStats] = useState<KegiatanStats | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [execProgress, setExecProgress] = useState<ExecutiveProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Kecamatan list once
  useEffect(() => {
    void getKecamatanList()
      .then((data) => setKecamatanList(data))
      .catch((err: unknown) => console.error("Gagal memuat daftar kecamatan", err));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kStats, aStats, eProg] = await Promise.all([
        getDashboardStats(tahun, selectedKecamatan),
        getAnalyticsStats(tahun, selectedKecamatan),
        getExecutiveProgress(tahun, selectedKecamatan),
      ]);
      setKegiatanStats(kStats);
      setAnalyticsStats(aStats);
      setExecProgress(eProg);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Sesi login berakhir. Silakan muat ulang atau login kembali.");
      } else {
        setError("Gagal memuat data progres fisik. Silakan coba lagi.");
      }
      setKegiatanStats(null);
      setAnalyticsStats(null);
      setExecProgress(null);
    } finally {
      setLoading(false);
    }
  }, [tahun, selectedKecamatan]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const availableYears = kegiatanStats?.availableYears ?? [new Date().getFullYear()];

  // Process monthly trend (cumulative running max for fisik to ensure realistic progress curve)
  let runningReal = 0;
  let runningRencana = 0;

  const trendData = execProgress?.monthly_trend?.length
    ? execProgress.monthly_trend.map((t) => {
        runningReal = Math.max(runningReal, t.fisik_avg ?? 0);
        runningRencana = Math.max(runningRencana, t.rencana_avg ?? 0);

        return {
          month: t.month,
          realisasi: Number(runningReal.toFixed(2)),
          rencana: Number(runningRencana.toFixed(2)),
          deviasi: Number((runningReal - runningRencana).toFixed(2)),
        };
      })
    : (analyticsStats?.trend?.map((t) => ({
        month: t.week,
        realisasi: t.realisasi ?? 0,
        rencana: t.rencana ?? 0,
        deviasi: Number(((t.realisasi ?? 0) - (t.rencana ?? 0)).toFixed(2)),
      })) ?? []);

  const latestTrendPoint = trendData.length ? trendData[trendData.length - 1] : null;
  const currentFisikReal = latestTrendPoint?.realisasi ?? 0;
  const currentFisikRencana = latestTrendPoint?.rencana ?? 0;
  const deviasiFisik = Number((currentFisikReal - currentFisikRencana).toFixed(1));

  const subKegiatanList = kegiatanStats?.subKegiatanStats ?? [];

  const trendConfig: ChartConfig = {
    realisasi: {
      label: "Fisik Realisasi (%)",
      color: "var(--chart-1)",
    },
    rencana: {
      label: "Fisik Rencana (%)",
      color: "var(--chart-2)",
    },
  };

  const subKegiatanChartData = subKegiatanList.map((item) => ({
    name: item.name.length > 25 ? `${item.name.slice(0, 25)}…` : item.name,
    fullName: item.name,
    progress: item.hasProgress ? item.progress : 0,
    count: item.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Progres Realisasi Fisik (Estimasi)</h1>
          <p className="text-muted-foreground text-sm">
            Capaian estimasi progres fisik, deviasi rencana vs realisasi, dan status lapangan per paket pekerjaan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Select Tahun */}
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

          {/* Refresh Button */}
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
        {/* Card 1: Rata-rata Progres Fisik Realisasi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Rata-rata Fisik Realisasi</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HardHat className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                {loading ? "…" : `${currentFisikReal.toFixed(1)}%`}
              </span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
                Estimasi Fisik
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Rata-rata capaian fisik paket aktif
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Progres Fisik Rencana */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Fisik Rencana (Target)</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                {loading ? "…" : `${currentFisikRencana.toFixed(1)}%`}
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Target Rencana
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Target kurva rencana akumulatif
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Deviasi Fisik */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Deviasi Progres Fisik</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-purple-500/10 text-purple-600 dark:text-purple-400">
              {deviasiFisik >= 0 ? <ArrowUpRight className="size-4 text-emerald-600" /> : <ArrowDownRight className="size-4 text-destructive" />}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-2xl tabular-nums leading-none tracking-tight ${deviasiFisik >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                {loading ? "…" : `${deviasiFisik >= 0 ? "+" : ""}${deviasiFisik}%`}
              </span>
              <Badge variant={deviasiFisik >= 0 ? "outline" : "destructive"} className={deviasiFisik >= 0 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : ""}>
                {deviasiFisik >= 0 ? "On Track" : deviasiFisik >= -5 ? "Watch" : "Lagging"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Selisih Realisasi dibanding Rencana
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Paket Pekerjaan Fisik & Non-Fisik */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Paket Pekerjaan Fisik & Non-Fisik</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Briefcase className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                {loading ? "…" : `${kegiatanStats?.pekerjaanFisik || 0} Fisik`}
              </span>
              {(kegiatanStats?.pekerjaanKonsultan || 0) > 0 && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {loading ? "…" : `${kegiatanStats?.pekerjaanKonsultan} Non-Fisik`}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Pagu Fisik: <span className="font-medium text-foreground">{loading ? "…" : formatRupiah(kegiatanStats?.totalPaguPekerjaanFisik || 0)}</span>
              {(kegiatanStats?.totalPaguPekerjaanKonsultan || 0) > 0 && (
                <>
                  {" · "}
                  Konsultan: <span className="font-medium text-foreground">{loading ? "…" : formatRupiah(kegiatanStats?.totalPaguPekerjaanKonsultan || 0)}</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart: Tren Progres Fisik Rencana vs Realisasi */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Progres Fisik (Rencana vs Realisasi)</CardTitle>
            <CardDescription>Perbandingan estimasi realisasi fisik (%) dan target rencana (%) per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : trendData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center text-muted-foreground text-sm">
                Belum ada data tren progres fisik untuk filter ini.
              </div>
            ) : (
              <ChartContainer config={trendConfig} className="w-full" style={{ height: 320 }}>
                <LineChart data={trendData}>
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
                    dataKey="realisasi"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Fisik Realisasi (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="rencana"
                    stroke="var(--chart-2)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Fisik Rencana (%)"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Rata-rata Progres Fisik per Sub Kegiatan */}
        <Card>
          <CardHeader>
            <CardTitle>Rata-rata Progres Fisik per Sub Kegiatan</CardTitle>
            <CardDescription>Capaian persentase estimasi fisik rata-rata per jenis sub kegiatan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : subKegiatanChartData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center text-muted-foreground text-sm">
                Belum ada data sub kegiatan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={subKegiatanChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={120} />
                  <ChartTooltip
                    formatter={(val) => [`${Number(val).toFixed(1)}%`, "Progres Fisik Rata-rata"]}
                  />
                  <Bar dataKey="progress" fill="var(--chart-1)" name="Progres Fisik (%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Capaian Progres Fisik per Sub Kegiatan
          </CardTitle>
          <CardDescription>
            Rincian jumlah paket, alokasi pagu fisik, dan status progres fisik lapangan per jenis sub kegiatan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : subKegiatanList.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              Tidak ada data sub kegiatan.
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Sub Kegiatan</TableHead>
                    <TableHead className="text-right">Jumlah Paket</TableHead>
                    <TableHead className="text-right">Pagu (Rp)</TableHead>
                    <TableHead className="w-[200px]">Rata-rata Progres Fisik</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subKegiatanList.map((item) => {
                    const paguRupiah = item.paguM * 1_000_000;
                    const statusVariant = !item.hasProgress ? null : item.progress >= 70 ? "emerald" : item.progress >= 50 ? "amber" : "destructive";

                    return (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground text-xs font-normal">
                              {item.count - item.batal} Paket aktif
                              {item.batal > 0 && ` · ${item.batal} Batal`}
                              {item.belumBerkontrak > 0 && ` · ${item.belumBerkontrak} Belum Kontrak`}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right tabular-nums font-medium">
                          <div className="flex flex-col items-end">
                            <span>{item.count} Paket</span>
                            <div className="flex flex-wrap justify-end gap-1 text-[11px] font-normal">
                              {item.belumBerkontrak > 0 && (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  {item.belumBerkontrak} Belum Kontrak
                                </span>
                              )}
                              {item.batal > 0 && (
                                <span className="text-destructive font-medium">
                                  {item.batal} Batal
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right tabular-nums">
                          {formatRupiah(paguRupiah)}
                        </TableCell>

                        <TableCell>
                          {item.hasProgress ? (
                            <div className="flex items-center gap-2">
                              <Progress value={item.progress} className="h-2 flex-1" />
                              <span className="text-xs font-semibold tabular-nums">{item.progress}%</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Belum ada progres</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right text-xs">
                          {statusVariant === "emerald" && (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                              On Track
                            </Badge>
                          )}
                          {statusVariant === "amber" && (
                            <Badge className="bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                              Watch
                            </Badge>
                          )}
                          {statusVariant === "destructive" && <Badge variant="destructive">Lagging</Badge>}
                          {statusVariant === null && <Badge variant="outline">Belum Ada Data</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
