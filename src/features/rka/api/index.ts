import api from '@/lib/api-client';
import type { RkaDocument, RkaJenis, RkaResponse } from '../types';

export const getRkaDocuments = (params?: { jenis?: RkaJenis; tahun?: string; per_page?: number }) => {
    return api.get<RkaResponse>('/rka', { params });
};

export const getRkaDocument = (id: number) => {
    return api.get<{ data: RkaDocument }>(`/rka/${id}`);
};

export const importRkaDocument = (jenis: RkaJenis, file: File) => {
    const formData = new FormData();
    formData.append('jenis', jenis);
    formData.append('file', file);

    return api.post<{ data: RkaDocument }>('/rka/import', formData);
};

export const deleteRkaDocument = (id: number) => {
    return api.delete<{ message: string }>(`/rka/${id}`);
};
