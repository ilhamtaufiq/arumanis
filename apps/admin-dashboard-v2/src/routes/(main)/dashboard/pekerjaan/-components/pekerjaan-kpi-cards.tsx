import { Briefcase, FileCheck, HardHat, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import type { ExecutiveProgressData, KegiatanStats } from "@/lib/api/dashboard-api";

interface PekerjaanKpiCardsProps {
  stats: KegiatanStats | null;
  execProgress: ExecutiveProgressData | null;
  loading: boolean;
}

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

export function PekerjaanKpiCards({ stats, execProgress, loading }: PekerjaanKpiCardsProps) {
  const {
    totalPekerjaan = 0,
    totalPaguPekerjaan = 0,
    pekerjaanFisik = 0,
    pekerjaanKonsultan = 0,
    totalPaguPekerjaanFisik = 0,
    totalPaguPekerjaanKonsultan = 0,
    pekerjaanBerkontrak = 0,
    pekerjaanBelumBerkontrak = 0,
    pekerjaanBatal = 0,
    totalNilaiKontrak = 0,
    totalOutput = 0,
    totalPenerima = 0,
    totalJiwa = 0,
  } = stats || {};

  const totalDisbursed = execProgress?.totals?.keuangan_total || 0;
  const latestFisikTrend = execProgress?.monthly_trend?.length
    ? execProgress.monthly_trend[execProgress.monthly_trend.length - 1]
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {/* 1. Total Pekerjaan & Pagu */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription>Total Pekerjaan & Pagu</CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <Briefcase className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : `${totalPekerjaan} Paket`}
            </span>
            {pekerjaanKonsultan > 0 && (
              <Badge variant="outline" className="text-[10px] bg-muted/50">
                {pekerjaanFisik} Fisik · {pekerjaanKonsultan} Non-Fisik
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Pagu Fisik: <span className="font-medium text-foreground">{loading ? "…" : formatRupiah(totalPaguPekerjaanFisik || totalPaguPekerjaan)}</span>
            {totalPaguPekerjaanKonsultan > 0 && (
              <>
                {" · "}
                Non-Fisik: <span className="font-medium text-foreground">{loading ? "…" : formatRupiah(totalPaguPekerjaanKonsultan)}</span>
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* 2. Status Berkontrak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription>Status Berkontrak</CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <FileCheck className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : pekerjaanBerkontrak}
            </span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              {loading ? "…" : `${totalPekerjaan > 0 ? Math.round((pekerjaanBerkontrak / totalPekerjaan) * 100) : 0}% Berkontrak`}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Nilai Kontrak: <span className="font-medium text-foreground">{loading ? "…" : formatRupiah(totalNilaiKontrak)}</span>
          </p>
        </CardContent>
      </Card>

      {/* 3. Status Paket (Batal & Belum Berkontrak) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription>Status Paket</CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <HardHat className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : pekerjaanBatal}
            </span>
            <Badge variant="destructive">
              {loading ? "…" : `${totalPekerjaan > 0 ? Math.round((pekerjaanBatal / (totalPekerjaan + pekerjaanBatal)) * 100) : 0}% Batal`}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Belum Berkontrak: <span className="font-medium text-foreground">{loading ? "…" : pekerjaanBelumBerkontrak}</span> (dari aktif)
          </p>
        </CardContent>
      </Card>

      {/* 4. Progress Fisik & Keuangan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription>Capaian Progres (Avg)</CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <HardHat className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : latestFisikTrend ? `${latestFisikTrend.fisik_avg}%` : "—"}
            </span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
              Fisik
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Sp2d Keuangan: <span className="font-medium text-foreground">{loading ? "…" : formatRupiah(totalDisbursed)}</span>
          </p>
        </CardContent>
      </Card>

      {/* 5. Output & Penerima */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription>Output & Penerima Manfaat</CardDescription>
          <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <Users className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : totalPenerima.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-medium text-muted-foreground">KK</span>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="font-semibold text-xl tabular-nums leading-none tracking-tight">
              {loading ? "…" : totalJiwa.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Jiwa</span>
          </div>
          <p className="text-muted-foreground text-xs">
            {loading ? "…" : `${totalOutput} Output · `}
            <span className="font-medium text-foreground">
              {loading ? "…" : `${totalPenerima.toLocaleString("id-ID")} KK (${totalJiwa.toLocaleString("id-ID")} Jiwa)`}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
