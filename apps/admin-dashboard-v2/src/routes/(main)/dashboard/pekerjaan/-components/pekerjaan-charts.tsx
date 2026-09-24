import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsStats, ExecutiveProgressData, KegiatanStats } from "@/lib/api/dashboard-api";

function formatRupiah(value: number): string {
  if (!value) return "Rp 0";
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

interface PekerjaanChartsProps {
  analyticsStats: AnalyticsStats | null;
  kegiatanStats: KegiatanStats | null;
  execProgress: ExecutiveProgressData | null;
  loading: boolean;
}

export function PekerjaanCharts({ analyticsStats, kegiatanStats, execProgress, loading }: PekerjaanChartsProps) {
  const trendConfig: ChartConfig = {
    realisasi: {
      label: "Fisik Realisasi (%)",
      color: "var(--chart-1)",
    },
    rencana: {
      label: "Fisik Rencana (%)",
      color: "var(--chart-2)",
    },
    keuangan_realisasi: {
      label: "Keuangan Realisasi (Rp)",
      color: "var(--chart-3)",
    },
    keuangan_rencana: {
      label: "Keuangan Rencana (Rp)",
      color: "var(--chart-4)",
    },
  };

  const kecamatanConfig: ChartConfig = {
    value: {
      label: "Pagu (M Rp)",
      color: "var(--chart-1)",
    },
  };

  // Akumulasi keuangan sum & running max fisik per bulan untuk mendapatkan Tren Kumulatif yang monotonik naik
  let runningKeuangan = 0;
  let runningFisikRealisasi = 0;
  let runningFisikRencana = 0;

  const trendData = execProgress?.monthly_trend?.length
    ? execProgress.monthly_trend.map((t) => {
        runningKeuangan += t.keuangan_sum ?? 0;
        // Jaga agar kurva progres fisik kumulatif tidak turun akibat penambahan paket baru (denominator)
        runningFisikRealisasi = Math.max(runningFisikRealisasi, t.fisik_avg ?? 0);
        runningFisikRencana = Math.max(runningFisikRencana, t.rencana_avg ?? 0);

        return {
          week: t.month,
          realisasi: Number(runningFisikRealisasi.toFixed(2)),
          rencana: Number(runningFisikRencana.toFixed(2)),
          keuangan_realisasi: runningKeuangan,
          keuangan_rencana: 0,
        };
      })
    : (analyticsStats?.trend ?? []);

  const hasKeuanganData = trendData.some((d) => (d.keuangan_realisasi ?? 0) > 0);
  const hasKeuanganRencana = trendData.some((d) => (d.keuangan_rencana ?? 0) > 0);
  const hasRencanaFisik = trendData.some((d) => (d.rencana ?? 0) > 0);

  const kecamatanData = kegiatanStats?.paguPekerjaanPerKecamatan?.slice(0, 10) || [];
  const subKegiatanData = kegiatanStats?.subKegiatanStats ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Line Chart: Tren Progres Fisik & Keuangan */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Progres Fisik & Keuangan (Kumulatif)</CardTitle>
          <CardDescription>
            Perbandingan realisasi dan rencana untuk fisik (%) dan akumulasi realisasi keuangan SP2D (Rp) per bulan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[320px] w-full rounded-xl" />
          ) : (
            <ChartContainer config={trendConfig} className="w-full" style={{ height: 380 }}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                {/* Left Y-Axis: Fisik (%) */}
                <YAxis
                  yAxisId="fisik"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                {/* Right Y-Axis: Keuangan (Rp) */}
                {hasKeuanganData && (
                  <YAxis
                    yAxisId="keuangan"
                    orientation="right"
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
                )}
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => {
                        const num = Number(value);
                        if (isNaN(num)) return String(value);
                        const key = String(item?.dataKey || name);
                        if (key === "realisasi" || key === "rencana" || key.includes("fisik") || key.includes("Fisik")) {
                          return `${num.toFixed(1)}%`;
                        }
                        if (key.includes("keuangan") || key.includes("Keuangan")) {
                          return formatRupiah(num);
                        }
                        return num;
                      }}
                    />
                  }
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                {/* Fisik lines */}
                <Line
                  yAxisId="fisik"
                  type="monotone"
                  dataKey="realisasi"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Fisik Realisasi (%)"
                />
                {hasRencanaFisik && (
                  <Line
                    yAxisId="fisik"
                    type="monotone"
                    dataKey="rencana"
                    stroke="var(--chart-2)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Fisik Rencana (%)"
                  />
                )}
                {/* Keuangan lines */}
                {hasKeuanganData && (
                  <Line
                    yAxisId="keuangan"
                    type="monotone"
                    dataKey="keuangan_realisasi"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Keuangan Realisasi (Rp)"
                  />
                )}
                {hasKeuanganRencana && (
                  <Line
                    yAxisId="keuangan"
                    type="monotone"
                    dataKey="keuangan_rencana"
                    stroke="var(--chart-4)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Keuangan Rencana (Rp)"
                  />
                )}
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart: Pagu Pekerjaan per Kecamatan */}
        <Card>
          <CardHeader>
            <CardTitle>Pagu Pekerjaan per Kecamatan (Miliar Rp)</CardTitle>
            <CardDescription>Top 10 sebaran alokasi anggaran pekerjaan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : kecamatanData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center text-muted-foreground text-sm">
                Belum ada data pagu per kecamatan untuk filter ini.
              </div>
            ) : (
              <ChartContainer config={kecamatanConfig} className="w-full" style={{ height: 320 }}>
                <BarChart
                  // API kirim juta rupiah; tampilkan miliar.
                  data={kecamatanData.map((d) => ({ ...d, value: Number((d.value / 1000).toFixed(2)) }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]}>
                    {kecamatanData.map((entry) => (
                      <Cell key={entry.name} fill="var(--chart-1)" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Info Progress per Sub Kegiatan */}
        <Card>
          <CardHeader>
            <CardTitle>Progres per Sub Kegiatan</CardTitle>
            <CardDescription>
              Ringkasan alokasi pagu dan capaian rata-rata progres per jenis sub kegiatan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : subKegiatanData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">
                Belum ada data sub kegiatan untuk filter ini.
              </div>
            ) : (
              subKegiatanData.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-muted-foreground">
                        {item.count} Paket · Pagu{" "}
                        {item.paguM >= 1000
                          ? `${(item.paguM / 1000).toFixed(1)} M`
                          : `${item.paguM.toFixed(0)} Jt`}
                        {item.sp2dTotal > 0 && <> · SP2D {formatRupiah(item.sp2dTotal)}</>}
                        {item.batal > 0 && (
                          <span className="text-red-500"> · Batal {item.batal}</span>
                        )}
                        {item.belumBerkontrak > 0 && (
                          <span className="text-amber-500"> · Blm Kontrak {item.belumBerkontrak}</span>
                        )}
                      </span>
                      {/* Belum ada realisasi → jangan tampilkan 0% seolah capaian nyata. */}
                      {item.hasProgress ? (
                        <span className="font-semibold text-primary">{item.progress}%</span>
                      ) : (
                        <span className="text-muted-foreground">Belum ada progres</span>
                      )}
                    </div>
                  </div>
                  <Progress value={item.hasProgress ? item.progress : 0} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
