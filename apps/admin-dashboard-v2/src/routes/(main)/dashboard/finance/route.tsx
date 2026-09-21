import { useCallback, useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
  ApiError,
  type ExecutiveProgressData,
  getDashboardStats,
  getExecutiveProgress,
  getKecamatanList,
  type KecamatanItem,
  type KegiatanStats,
} from "@/lib/api/dashboard-api";

export const Route = createFileRoute("/(main)/dashboard/finance")({
  component: FinancePage,
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

function FinancePage() {
  const [tahun, setTahun] = useState<string>(String(new Date().getFullYear()));
  const [selectedKecamatan, setSelectedKecamatan] = useState<string[]>([]);
  const [kecamatanList, setKecamatanList] = useState<KecamatanItem[]>([]);
  const [kegiatanStats, setKegiatanStats] = useState<KegiatanStats | null>(null);
  const [execProgress, setExecProgress] = useState<ExecutiveProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load kecamatan list once
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
        setError("Gagal memuat data keuangan dari server (HTTP 500 / kendala koneksi). Silakan coba lagi nanti.");
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

  // Calculated figures
  const totalPagu = kegiatanStats?.totalPaguPekerjaan || 0;
  const totalNilaiKontrak = kegiatanStats?.totalNilaiKontrak || 0;
  const totalRealisasiSp2d = execProgress?.totals?.keuangan_total || 0;

  const pctKontrakDariPagu = totalPagu > 0 ? Math.round((totalNilaiKontrak / totalPagu) * 100) : 0;
  const pctSp2dDariKontrak = totalNilaiKontrak > 0 ? ((totalRealisasiSp2d / totalNilaiKontrak) * 100).toFixed(1) : "0";
  const pctSp2dDariPagu = totalPagu > 0 ? ((totalRealisasiSp2d / totalPagu) * 100).toFixed(1) : "0";

  const sisaKontrakBelumSp2d = Math.max(0, totalNilaiKontrak - totalRealisasiSp2d);
  const sisaPaguEfisiensi = Math.max(0, totalPagu - totalNilaiKontrak);

  // Kumulasi tren keuangan bulanan
  let runningKeuangan = 0;
  const monthlyData = execProgress?.monthly_trend?.length
    ? execProgress.monthly_trend.map((t) => {
        runningKeuangan += t.keuangan_sum ?? 0;
        return {
          month: t.month,
          realisasi: runningKeuangan,
          bulanan: t.keuangan_sum ?? 0,
        };
      })
    : [];

  const subKegiatanList = kegiatanStats?.subKegiatanStats ?? [];

  // Chart config for recharts
  const trendConfig: ChartConfig = {
    realisasi: {
      label: "Realisasi SP2D Kumulatif (Rp)",
      color: "var(--chart-1)",
    },
    bulanan: {
      label: "SP2D Bulanan (Rp)",
      color: "var(--chart-2)",
    },
  };

  const subKegiatanChartData = subKegiatanList.map((item) => ({
    name: item.name.length > 25 ? `${item.name.slice(0, 25)}…` : item.name,
    fullName: item.name,
    pagu: Number((item.paguM / 1000).toFixed(2)),
    sp2d: Number((item.sp2dTotal / 1_000_000_000).toFixed(2)),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Realisasi Keuangan & Anggaran</h1>
          <p className="text-muted-foreground text-sm">
            Ringkasan realisasi SP2D, alokasi pagu anggaran, dan nilai kontrak per sub kegiatan
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
        {/* Card 1: Total Pagu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Pagu Anggaran</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Wallet className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : formatRupiah(totalPagu)}
            </span>
            <p className="text-muted-foreground text-xs">
              Alokasi Pagu Pekerjaan TA {tahun}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Nilai Kontrak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Nilai Kontrak</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                {loading ? "…" : formatRupiah(totalNilaiKontrak)}
              </span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
                {pctKontrakDariPagu}% Pagu
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Sisa Pagu (Efisiensi): <span className="font-medium text-foreground">{formatRupiah(sisaPaguEfisiensi)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Realisasi SP2D */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Realisasi SP2D (Keuangan)</CardDescription>
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
                {pctSp2dDariKontrak}% Kontrak
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Realisasi dari Pagu: <span className="font-medium text-emerald-600 dark:text-emerald-400">{pctSp2dDariPagu}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Sisa Belum Pencairan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Sisa Kontrak (Belum SP2D)</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg border bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : formatRupiah(sisaKontrakBelumSp2d)}
            </span>
            <p className="text-muted-foreground text-xs">
              Tagihan belum cair dari nilai kontrak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart: Tren Kumulatif SP2D */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Realisasi SP2D Keuangan (Kumulatif)</CardTitle>
            <CardDescription>Pertumbuhan akumulasi pencairan dana SP2D per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : monthlyData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center text-muted-foreground text-sm">
                Belum ada data tren pencairan SP2D untuk filter ini.
              </div>
            ) : (
              <ChartContainer config={trendConfig} className="w-full" style={{ height: 320 }}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => {
                      if (!v) return "0";
                      if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
                      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}Jt`;
                      return `${v}`;
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(val) => formatRupiah(Number(val))}
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
                    name="SP2D Kumulatif (Rp)"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Pagu vs Realisasi per Sub Kegiatan */}
        <Card>
          <CardHeader>
            <CardTitle>Alokasi Pagu & SP2D per Sub Kegiatan</CardTitle>
            <CardDescription>Perbandingan alokasi pagu (Miliar Rp) dan realisasi SP2D (Miliar Rp)</CardDescription>
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
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} M`} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={120} />
                  <ChartTooltip
                    formatter={(val, name, item) => [
                      formatRupiah(Number(val) * 1_000_000_000),
                      item?.dataKey === "pagu" || String(name).includes("Pagu") ? "Pagu Anggaran" : "Realisasi SP2D",
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

      {/* Sub Kegiatan Financial Realization Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Rincian Realisasi Keuangan per Sub Kegiatan
          </CardTitle>
          <CardDescription>
            Detail paket pekerjaan, alokasi pagu, realisasi SP2D, dan persentase serapan keuangan
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
              Tidak ada data sub kegiatan untuk filter ini.
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Sub Kegiatan</TableHead>
                    <TableHead className="text-right">Jumlah Paket</TableHead>
                    <TableHead className="text-right">Pagu Anggaran</TableHead>
                    <TableHead className="text-right">Realisasi SP2D</TableHead>
                    <TableHead className="w-[180px]">Serapan Keuangan</TableHead>
                    <TableHead className="text-right">Status Paket</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subKegiatanList.map((item) => {
                    const paguRupiah = item.paguM * 1_000_000;
                    const pctSerapan = paguRupiah > 0 ? Math.min(100, Math.round((item.sp2dTotal / paguRupiah) * 100)) : 0;

                    return (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground text-xs font-normal">
                              Rata-rata Progres Fisik: {item.hasProgress ? `${item.progress}%` : "Belum ada progres"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right tabular-nums font-medium">
                          {item.count} Paket
                        </TableCell>

                        <TableCell className="text-right tabular-nums">
                          {formatRupiah(paguRupiah)}
                        </TableCell>

                        <TableCell className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(item.sp2dTotal)}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium tabular-nums">{pctSerapan}%</span>
                            </div>
                            <Progress value={pctSerapan} className="h-2" />
                          </div>
                        </TableCell>

                        <TableCell className="text-right text-xs">
                          <div className="flex flex-col items-end gap-1">
                            {item.batal > 0 && (
                              <Badge variant="destructive" className="text-[10px]">
                                {item.batal} Batal
                              </Badge>
                            )}
                            {item.belumBerkontrak > 0 && (
                              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                                {item.belumBerkontrak} Belum Kontrak
                              </Badge>
                            )}
                            {item.count - item.batal - item.belumBerkontrak > 0 && (
                              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                {item.count - item.batal - item.belumBerkontrak} Berkontrak
                              </Badge>
                            )}
                          </div>
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
