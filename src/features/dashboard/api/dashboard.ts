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
