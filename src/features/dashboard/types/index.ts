export interface KegiatanStats {
    totalKegiatan: number;
    totalPagu: number;
    kegiatanPerTahun: ChartData[];
    kegiatanPerSumberDana: ChartData[];
    paguPerTahun: ChartData[];
    availableYears: string[];
    totalPekerjaan: number;
    totalPaguPekerjaan: number;
    pekerjaanPerKecamatan: ChartData[];
    pekerjaanPerDesa: ChartData[];
    paguPekerjaanPerKecamatan: ChartData[];
    totalKontrak: number;
    totalNilaiKontrak: number;
    kontrakPerPenyedia: ChartData[];
    nilaiKontrakPerPenyedia: ChartData[];
    totalOutput: number;
    outputPerSatuan: ChartData[];
    totalPenerima: number;
    totalJiwa: number;
    penerimaKomunalVsIndividu: ChartData[];
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
