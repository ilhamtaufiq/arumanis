import { useCallback, useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

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

import { PekerjaanCharts } from "./-components/pekerjaan-charts";
import { PekerjaanHeader } from "./-components/pekerjaan-header";
import { PekerjaanKpiCards } from "./-components/pekerjaan-kpi-cards";

export const Route = createFileRoute("/(main)/dashboard/pekerjaan")({
  component: PekerjaanDashboardPage,
});

function PekerjaanDashboardPage() {
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
      // Bedakan "gagal ambil data" dari "data kosong" — jangan tampilkan 0 seolah valid.
      setError(err instanceof ApiError ? err.message : "Gagal memuat data dashboard");
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

  // Tahun hanya dari data; sebelum tersedia pakai tahun berjalan, bukan daftar mock.
  const availableYears = kegiatanStats?.availableYears ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PekerjaanHeader
        tahun={tahun}
        onTahunChange={setTahun}
        availableYears={availableYears}
        selectedKecamatan={selectedKecamatan}
        onKecamatanChange={setSelectedKecamatan}
        kecamatanList={kecamatanList}
        onRefresh={fetchData}
        loading={loading}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      )}

      <PekerjaanKpiCards stats={kegiatanStats} execProgress={execProgress} loading={loading} />

      <PekerjaanCharts
        analyticsStats={analyticsStats}
        kegiatanStats={kegiatanStats}
        execProgress={execProgress}
        loading={loading}
      />
    </div>
  );
}
