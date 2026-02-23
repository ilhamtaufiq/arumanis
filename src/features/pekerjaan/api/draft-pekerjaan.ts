import api from '@/lib/api-client';
import type { DraftPekerjaan, DraftPekerjaanResponse } from '../types';

export const getDraftPekerjaan = async (params?: any) => {
    return await api.get<DraftPekerjaanResponse>('/draft-pekerjaan', { params });
};

export const createDraftPekerjaan = async (data: any) => {
    return await api.post<DraftPekerjaan>('/draft-pekerjaan', data);
};

export const updateDraftPekerjaan = async (id: number, data: any) => {
    return await api.put<DraftPekerjaan>(`/draft-pekerjaan/${id}`, data);
};

export const deleteDraftPekerjaan = async (id: number) => {
    return await api.delete<any>(`/draft-pekerjaan/${id}`);
};
