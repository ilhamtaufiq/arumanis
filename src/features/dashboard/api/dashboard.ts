import apiClient from '@/lib/axios';
import type { KegiatanStats } from '../types';

export const getDashboardStats = async (year?: string) => {
    const response = await apiClient.get<{ data: KegiatanStats }>('/dashboard/stats', {
        params: { tahun: year }
    });
    return response.data.data;
};
