import api from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface AppSetting {
    id: number;
    key: string;
    value: string | null;
    type: 'text' | 'file';
    updated_at: string;
}

export interface AppSettingsResponse {
    data: AppSetting[];
}

export interface AppSettingsFormData {
    app_name?: string;
    app_description?: string;
    tahun_anggaran?: string;
    logo?: File;
    favicon?: File;
}

// API functions
export const getAppSettings = async (): Promise<AppSettingsResponse> => {
    return api.get<AppSettingsResponse>('/app-settings');
};

export const updateAppSettings = async (data: AppSettingsFormData): Promise<AppSettingsResponse> => {
    const formData = new FormData();

    if (data.app_name !== undefined) {
        formData.append('app_name', data.app_name);
    }
    if (data.app_description !== undefined) {
        formData.append('app_description', data.app_description);
    }
    if (data.tahun_anggaran !== undefined) {
        formData.append('tahun_anggaran', data.tahun_anggaran);
    }
    if (data.logo) {
        formData.append('logo', data.logo);
    }
    if (data.favicon) {
        formData.append('favicon', data.favicon);
    }

    return api.post<AppSettingsResponse>('/app-settings', formData);
};

// Hooks
export const useAppSettings = () => {
    return useQuery({
        queryKey: ['app-settings'],
        queryFn: getAppSettings,
    });
};

export const useUpdateAppSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAppSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['app-settings'] });
        },
    });
};

// Helper to get setting value from array
export const getSettingValue = (settings: AppSetting[] | undefined, key: string): string => {
    if (!settings) return '';
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
};
