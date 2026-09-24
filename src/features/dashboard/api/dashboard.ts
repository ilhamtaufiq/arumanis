import api from '@/lib/api-client';
import type { KegiatanStats, DataQualityStats, AnalyticsStats } from '../types';

export const getDashboardStats = async (year?: string) => {
    const response = await api.get<{ data: KegiatanStats }>('/dashboard/stats', {
        params: { tahun: year }
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
