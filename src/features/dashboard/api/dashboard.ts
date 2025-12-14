import api from '@/lib/api-client';
import type { KegiatanStats } from '../types';

export const getDashboardStats = async (year?: string) => {
    const response = await api.get<{ data: KegiatanStats }>('/dashboard/stats', {
        params: { tahun: year }
    });
    return response.data;
};
