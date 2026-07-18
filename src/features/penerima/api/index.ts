import api from '@/lib/api-client';
import type {
    Penerima,
    PenerimaFormData,
    PenerimaParams,
    PenerimaResponse,
    PenerimaSummary,
} from '../types';

export const getPenerimaList = async (params?: PenerimaParams) => {
    return api.get<PenerimaResponse>('/penerima', { params: params as Record<string, string | number | undefined> });
};

export type PenerimaPekerjaanStats = {
    pekerjaan_id: number;
    total_penerima: number;
    komunal_count: number;
    non_komunal_count: number;
};

/** Ringkasan penerima (total, individu, komunal, jiwa) — filter opsional by tahun. */
export const getPenerimaSummary = async (params?: { tahun?: string }) => {
    return api.get<PenerimaSummary>('/penerima/summary', {
        params: params as Record<string, string | undefined>,
    });
};

/** Breakdown Individual vs Komunal untuk satu pekerjaan. */
export const getPenerimaPekerjaanStats = async (pekerjaanId: number) => {
    return api.get<PenerimaPekerjaanStats>(`/penerima/pekerjaan/${pekerjaanId}/stats/komunal`);
};

export const getPenerima = async (id: number) => {
    return api.get<{ data: Penerima }>(`/penerima/${id}`);
};

export const createPenerima = async (data: PenerimaFormData) => {
    return api.post<{ data: Penerima }>('/penerima', data);
};

export const updatePenerima = async ({ id, data }: { id: number; data: PenerimaFormData }) => {
    return api.put<{ data: Penerima }>(`/penerima/${id}`, data);
};

export const deletePenerima = async (id: number) => {
    await api.delete(`/penerima/${id}`);
};

