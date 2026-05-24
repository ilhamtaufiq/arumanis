import api from '@/lib/api-client';
import type { 
    UnitSpam, 
    UnitSpamResponse, 
    UnitSpamStats,
    SpamUnitFilters,
} from '../types';

export const importSpamData = async (file: File): Promise<{message: string, output: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<{message: string, output: string}>('/spam-units/import', formData);
};

export const getSpamUnits = async (params?: SpamUnitFilters) => {
    return api.get<UnitSpamResponse>('/spam-units', { 
        params: {
            ...params,
            _t: Date.now()
        } 
    });
};

export const getSpamUnit = async (id: number) => {
    return api.get<{ success: boolean; data: UnitSpam }>(`/spam-units/${id}?_t=${Date.now()}`);
};

export const getSpamUnitStats = async (params?: { kecamatan_id?: number; tahun?: string }) => {
    return api.get<{ success: boolean; data: UnitSpamStats }>('/spam-units/stats', { 
        params: {
            ...params,
            _t: Date.now()
        } 
    });
};

export const createSpamUnit = async (data: Omit<UnitSpam, 'id' | 'created_at' | 'updated_at' | 'desa' | 'pengelola' | 'achievements' | 'checklists'> & {
    pokmas?: string;
    perdes?: string;
    kepala?: string;
    bendahara?: string;
    sekretaris?: string;
}) => {
    return api.post<{ success: boolean; data: UnitSpam }>('/spam-units', data);
};

export const updateSpamUnit = async (id: number, data: Partial<Omit<UnitSpam, 'id' | 'created_at' | 'updated_at' | 'desa' | 'pengelola' | 'achievements' | 'checklists'>> & {
    pokmas?: string;
    perdes?: string;
    kepala?: string;
    bendahara?: string;
    sekretaris?: string;
}) => {
    return api.put<{ success: boolean; data: UnitSpam }>(`/spam-units/${id}`, data);
};

export const deleteSpamUnit = async (id: number) => {
    await api.delete(`/spam-units/${id}`);
};

export const createSpamAchievement = async (unitSpamId: number, data: {
    tahun: string;
    jumlah_sr: number;
    jumlah_kk: number;
    jumlah_jiwa: number;
    jumlah_bjp_kk?: number;
    jumlah_bjp_jiwa?: number;
    catatan?: string;
}) => {
    return api.post<{ success: boolean; data: any }>(`/spam-units/${unitSpamId}/achievements`, data);
};

export const createSpamBudget = async (unitSpamId: number, data: {
    tahun: string;
    nilai_kontrak: number;
    nama_paket?: string;
    sumber_dana?: string;
}) => {
    return api.post<{ success: boolean; data: any }>(`/spam-units/${unitSpamId}/budgets`, data);
};

export const deleteSpamBudget = async (unitSpamId: number, budgetId: number) => {
    return api.delete(`/spam-units/${unitSpamId}/budgets/${budgetId}`);
};
