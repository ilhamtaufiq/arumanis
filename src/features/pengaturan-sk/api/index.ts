import api from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Sk {
    id: number;
    nomor_sk: string;
    nama: string;
    tanggal_sk: string | null;
    uploaded_by?: number | null;
    file_url: string;
    file_name?: string | null;
    mime_type?: string | null;
    size?: number | null;
    media_id?: number | null;
    uploader?: { id: number; name: string; email: string } | null;
    created_at: string;
    updated_at: string;
}

export interface SkResponse {
    data: Sk[];
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface SkParams {
    page?: number;
    search?: string;
}

export const getSkList = async (params?: SkParams) => {
    return api.get<SkResponse>('/sk', { params: params as Record<string, string | number | undefined> });
};

export const createSk = async (data: FormData) => {
    return api.post<{ data: Sk }>('/sk', data);
};

export const updateSk = async ({ id, data }: { id: number; data: FormData }) => {
    // Use POST with _method=PUT for FormData in Laravel
    data.append('_method', 'PUT');
    return api.post<{ data: Sk }>(`/sk/${id}`, data);
};

export const deleteSk = async (id: number) => {
    await api.delete(`/sk/${id}`);
};

export const getSkDownloadUrl = (id: number): string => {
    return `/bff/api/sk/${id}`;
};

// Hooks
export const useSkList = (params?: SkParams) => {
    return useQuery({
        queryKey: ['sk', params?.search ?? '', params?.page ?? 1],
        queryFn: () => getSkList(params),
        placeholderData: (prev) => prev,
    });
};

export const useCreateSk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSk,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sk'] }),
    });
};

export const useUpdateSk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSk,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sk'] }),
    });
};

export const useDeleteSk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSk,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sk'] }),
    });
};
