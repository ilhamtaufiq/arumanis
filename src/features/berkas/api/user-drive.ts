import api from '@/lib/api-client';

export type UserDriveItem = {
    id: number;
    parent_id: number | null;
    name: string;
    kind: 'folder' | 'file';
    original_filename: string | null;
    file_url?: string | null;
    mime_type?: string | null;
    file_size?: number | null;
    media_id?: number | null;
    created_at: string;
    updated_at: string;
};

export type UserDriveListParams = {
    parent_id?: number | null;
    search?: string;
    page?: number;
    per_page?: number;
};

export type UserDriveListResponse = {
    data: UserDriveItem[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
    };
};

export async function getUserDriveList(params?: UserDriveListParams): Promise<UserDriveListResponse> {
    const response = await api.get<UserDriveListResponse>('/user-drive', {
        params: {
            parent_id: params?.parent_id ?? undefined,
            search: params?.search,
            page: params?.page,
            per_page: params?.per_page,
        },
    });

    return {
        data: response.data ?? [],
        meta: response.meta,
    };
}

export async function getUserDriveItem(id: number): Promise<UserDriveItem> {
    const response = await api.get<{ data: UserDriveItem }>(`/user-drive/${id}`);
    return response.data;
}

export async function createUserDriveFolder(data: {
    name: string;
    parent_id?: number | null;
}): Promise<UserDriveItem> {
    const response = await api.post<{ data: UserDriveItem }>('/user-drive/folders', data);
    return response.data;
}

export async function uploadUserDriveFile(data: {
    file: File;
    name?: string;
    parent_id?: number | null;
}): Promise<UserDriveItem> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.name?.trim()) formData.append('name', data.name.trim());
    if (data.parent_id) formData.append('parent_id', String(data.parent_id));

    const response = await api.post<{ data: UserDriveItem }>('/user-drive/files', formData);
    return response.data;
}

export async function deleteUserDriveItem(id: number): Promise<void> {
    await api.delete(`/user-drive/${id}`);
}