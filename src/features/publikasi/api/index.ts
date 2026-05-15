import api from '@/lib/api-client';

export interface PublikasiPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string | null;
    cover_image: string | null;
    is_published: boolean;
    is_internal: boolean;
    published_at: string | null;
    user: {
        id: number;
        name: string;
        avatar: string | null;
        jabatan: string | null;
    };
    created_at: string;
    updated_at: string;
}

export interface PublikasiResponse {
    data: PublikasiPost[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const getPublikasi = async (params?: { category?: string; published?: boolean; page?: number }) => {
    const queryParams: Record<string, string | number | undefined> = {
        category: params?.category,
        page: params?.page,
    };
    if (params?.published !== undefined) {
        queryParams.published = params.published ? 1 : 0;
    }
    return api.get<PublikasiResponse>('/blog', { params: queryParams });
};

export const getPublikasiDetail = async (id: number | string) => {
    const response = await api.get<{ data: PublikasiPost }>(`/blog/${id}`);
    return response.data;
};

export const createPublikasi = async (data: any) => {
    return api.post<{ data: PublikasiPost; message: string }>('/blog', data);
};

export const updatePublikasi = async (id: number, data: any) => {
    return api.put<{ data: PublikasiPost; message: string }>(`/blog/${id}`, data);
};

export const deletePublikasi = async (id: number) => {
    return api.delete<{ message: string }>(`/blog/${id}`);
};
