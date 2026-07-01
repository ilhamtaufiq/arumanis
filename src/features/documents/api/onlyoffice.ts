import api from '@/lib/api-client';

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

export async function fetchOnlyOfficeConfig(mediaId: number): Promise<OnlyOfficeEditorConfig> {
    const response = await api.get<OnlyOfficeConfigApiResponse>(`/onlyoffice/media/${mediaId}/config`);
    return response.data;
}