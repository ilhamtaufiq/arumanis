export interface KegiatanStats {
    totalKegiatan: number;
    totalPagu: number;
    kegiatanPerTahun: ChartData[];
    kegiatanPerSumberDana: ChartData[];
    paguPerTahun: ChartData[];
    availableYears: string[];
    /** Paket aktif (exclude canceled). Sama dengan pekerjaanAktif. */
    totalPekerjaan: number;
    totalPaguPekerjaan: number;
    /** Pagu paket aktif fisik (non-konsultan). */
    totalPaguPekerjaanFisik?: number;
    /** Pagu paket aktif konsultan. */
    totalPaguPekerjaanKonsultan?: number;
    /** Rekap status paket (TA filter). */
    pekerjaanAktif?: number;
    pekerjaanBatal?: number;
    pekerjaanBerkontrak?: number;
    pekerjaanBelumBerkontrak?: number;
    /** Paket aktif fisik (is_konsultan false/null). */
    pekerjaanFisik?: number;
    /** Paket aktif konsultan. */
    pekerjaanKonsultan?: number;
    pekerjaanFisikBerkontrak?: number;
    pekerjaanFisikBelumBerkontrak?: number;
    pekerjaanPerKecamatan: ChartData[];
    pekerjaanPerDesa: ChartData[];
    paguPekerjaanPerKecamatan: ChartData[];
    totalKontrak: number;
    totalNilaiKontrak: number;
    kontrakPerPenyedia: ChartData[];
    nilaiKontrakPerPenyedia: ChartData[];
    totalOutput: number;
    outputPerKomponen: ChartData[];
    totalPenerima: number;
    totalJiwa: number;
    penerimaKomunalVsIndividu: ChartData[];
}

export interface AnalyticsStats {
    trend: Array<{
        week: string;
        rencana: number;
        realisasi: number;
    }>;
    regions: ChartData[];
    categories: ChartData[];
}

export interface DataQualityStats {
    no_coordinates: number;
    no_photos: number;
    started_no_photos: number;
    no_contracts: number;
    total_jobs: number;
}

export interface ChartData {
    name: string;
    value: number;
    label?: string;
    [key: string]: string | number | undefined;
}

export interface DashboardResponse {
    data: KegiatanStats;
}

export interface AnalyticsResponse {
    data: AnalyticsStats;
}
