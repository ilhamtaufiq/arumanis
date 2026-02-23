import api from '@/lib/api-client';
import type { Penyedia } from '../types';

export const getPenyedia = async (params?: any) => {
    return await api.get<{ data: Penyedia[] }>('/penyedia', { params });
};
