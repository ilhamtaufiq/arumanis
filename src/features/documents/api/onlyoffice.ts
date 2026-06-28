import api from '@/lib/api-client';
import { ApiError } from '@/lib/api-client.types';

export type OnlyOfficeEditorMode = 'edit' | 'view';

export type OnlyOfficeEditorConfig = {
    documentServerUrl: string;
    config: Record<string, unknown>;
    mode: OnlyOfficeEditorMode;
    media: {
        id: number;
        file_name: string;
        mime_type: string | null;
    };
};

type OnlyOfficeConfigApiResponse = {
    data: OnlyOfficeEditorConfig;
};

type OnlyOfficeFallbackResponse = {
    message?: string;
    fallback?: boolean;
};

export function isOnlyOfficeFallbackError(error: unknown): boolean {
    if (!(error instanceof ApiError)) return false;
    if (![503, 422].includes(error.status)) return false;
    const data = error.data as OnlyOfficeFallbackResponse | undefined;
    return data?.fallback === true;
}

export async function fetchOnlyOfficeConfig(mediaId: number): Promise<OnlyOfficeEditorConfig> {
    const response = await api.get<OnlyOfficeConfigApiResponse>(`/onlyoffice/media/${mediaId}/config`);
    return response.data;
}