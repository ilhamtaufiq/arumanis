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
    is_featured: boolean;
    published_at: string | null;
    featured_at: string | null;
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

const emptyPublikasiResponse: PublikasiResponse = {
    data: [],
    meta: {
        current_page: 1,
        last_page: 1,
        per_page: 0,
        total: 0,
    },
};

export const getPublikasi = async (params?: { category?: string; published?: boolean; page?: number }) => {
    const queryParams: Record<string, string | number | undefined> = {
        category: params?.category,
        page: params?.page,
    };
    if (params?.published !== undefined) {
        queryParams.published = params.published ? 1 : 0;
    }
    const response = await api.get<PublikasiResponse | undefined>('/blog', { params: queryParams });
    return response && Array.isArray(response.data) ? response : emptyPublikasiResponse;
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

export const featurePublikasi = async (id: number) => {
    return api.post<{ data: PublikasiPost; message: string }>(`/blog/${id}/feature`);
};

export const unfeaturePublikasi = async (id: number) => {
    return api.delete<{ data: PublikasiPost; message: string }>(`/blog/${id}/feature`);
};

export const uploadPublikasiVideo = async (
    file: File,
    onProgress?: (progress: number) => void
) => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise<{ url: string; media_id: number; message: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/bff/api/blog/upload-video');
        xhr.withCredentials = true;
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(response);
                } else {
                    reject(response);
                }
            } catch {
                reject(new Error('Respons upload tidak valid'));
            }
        };

        xhr.onerror = () => reject(new Error('Gagal mengunggah video'));
        xhr.send(formData);
    });
};
