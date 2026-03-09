import api from '@/lib/api-client';
import type { Penyedia, PenyediaDto } from '../types';

interface PaginatedResponse<T> {
    data: T[];
    meta: { current_page: number; last_page: number; total: number; per_page: number; links: any[] };
    links: { first: string; last: string; prev: string | null; next: string | null };
}

export async function getPenyedia(params?: { page?: number; search?: string; per_page?: number }) {
    return api.get<PaginatedResponse<Penyedia>>('/penyedia', { params });
}

export async function getPenyediaById(id: number) {
    return api.get<{ data: Penyedia }>(`/penyedia/${id}`);
}

export async function createPenyedia(data: PenyediaDto) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        const val = data[key as keyof PenyediaDto];
        if (key === 'dokumen' && val) {
            (val as File[]).forEach((file) => formData.append('dokumen[]', file));
        } else if (val !== undefined && val !== null) {
            formData.append(key, val as unknown as string);
        }
    });

    return api.post<{ data: Penyedia }>('/penyedia', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export async function updatePenyedia(id: number, data: PenyediaDto) {
    const formData = new FormData();
    // Laravel requires _method=PUT for multipart/form-data updates
    formData.append('_method', 'PUT');

    Object.keys(data).forEach((key) => {
        const val = data[key as keyof PenyediaDto];
        if (key === 'dokumen' && val) {
            (val as File[]).forEach((file) => formData.append('dokumen[]', file));
        } else if (key === 'delete_dokumen' && val) {
            (val as number[]).forEach((idItem) => formData.append('delete_dokumen[]', idItem.toString()));
        } else if (val !== undefined && val !== null) {
            formData.append(key, val as unknown as string);
        }
    });

    return api.post<{ data: Penyedia }>(`/penyedia/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export async function deletePenyedia(id: number) {
    return api.delete(`/penyedia/${id}`);
}
