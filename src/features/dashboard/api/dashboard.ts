import api from '@/lib/api-client';
import type { KegiatanStats, DataQualityStats, AnalyticsStats } from '../types';

export const getDashboardStats = async (year?: string, tagId?: number) => {
    const response = await api.get<{ data: KegiatanStats }>('/dashboard/stats', {
        params: { tahun: year, tag_id: tagId }
    });
    return response.data;
};

export const getDataQualityStats = async (year?: string) => {
    const response = await api.get<{ data: DataQualityStats }>('/data-quality/stats', {
        params: { tahun: year }
    });
    return response.data;
};
export const getAnalyticsStats = async (year?: string, kecamatanIds?: string[]) => {
    const response = await api.get<{ data: AnalyticsStats }>('/dashboard/analytics', {
        params: {
            tahun: year,
            kecamatan_ids: kecamatanIds?.join(',')
        }
    });
    return response.data;
};

export interface MonthlyProgressTrend {
    month: string;
    fisik_avg: number;
    keuangan_sum: number;
}

export interface ExecutiveProgressData {
    monthly_trend: MonthlyProgressTrend[];
    totals: {
        keuangan_total: number;
    };
}

export const getExecutiveProgress = async (tahun: string, pekerjaanIds?: number[]) => {
    const response = await api.get<{ data: ExecutiveProgressData }>('/dashboard/executive-progress', {
        params: {
            tahun,
            pekerjaan_ids: pekerjaanIds?.join(','),
        },
    });
    return response.data;
};

export interface ProgresKpi {
    total_pekerjaan: number
    total_pagu: number
    rata_progres: number | null
    belum_progres: number
}

export interface PengawasKpi {
    aktif: number
    pekerjaan_diawasi: number
    belum_diawasi: number
    rata_progres: number | null
}

export interface ProgresPerKecamatan {
    nama: string
    jumlah: number
    rata_progres: number | null
}

export interface ProgresPerPengawas {
    user_id: number
    nama: string
    role: 'pengawas' | 'konsultan_pengawas'
    jumlah_pekerjaan: number
    rata_progres: number | null
}

export interface ProgresMvp {
    kpi: ProgresKpi
    pengawas: {
        pengawas: PengawasKpi
        konsultan_pengawas: PengawasKpi
    }
    per_kecamatan: ProgresPerKecamatan[]
    per_pengawas: ProgresPerPengawas[]
}

export const getProgresMvp = async (year?: string) => {
    const response = await api.get<{ data: ProgresMvp }>('/dashboard/progres-mvp', {
        params: { tahun: year },
    });
    return response.data;
};
