import api from '@/lib/api-client';
import type { Output, OutputResponse, OutputParams } from '../types';

export interface OutputRekapItem {
    komponen: string;
    satuan: string;
    total_volume: number;
    jumlah_pekerjaan: number;
    pekerjaan: {
        id: number;
        pekerjaan_id: number;
        nama_paket: string;
        volume: number;
        penerima_is_optional: boolean;
        sub_bidang: string | null;
    }[];
}

export interface OutputSummaryResponse {
    total_output: number;
    wajib_count: number;
    opsional_count: number;
    total_volume: number;
    rekap: OutputRekapItem[];
}

export const getOutputSummary = async (params?: { tahun?: string }) => {
    return api.get<OutputSummaryResponse>('/output/summary', { params: params as Record<string, string | undefined> });
};


export const getOutput = async (params?: OutputParams) => {
    return api.get<OutputResponse>('/output', { params: params as Record<string, string | number | undefined> });
};

export const getOutputById = async (id: number) => {
    return api.get<{ data: Output }>(`/output/${id}`);
};

export const createOutput = async (data: Omit<Output, 'id' | 'created_at' | 'updated_at' | 'pekerjaan'>) => {
    return api.post<{ data: Output }>('/output', data);
};

export const updateOutput = async (id: number, data: Partial<Omit<Output, 'id' | 'created_at' | 'updated_at' | 'pekerjaan'>>) => {
    return api.put<{ data: Output }>(`/output/${id}`, data);
};

export const deleteOutput = async (id: number) => {
    await api.delete(`/output/${id}`);
};
