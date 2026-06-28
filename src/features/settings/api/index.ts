import api from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface AppSetting {
    id: number;
    key: string;
    value: string | null;
    type: 'text' | 'file';
    is_configured?: boolean;
    updated_at: string;
}

export interface AppSettingsResponse {
    data: AppSetting[];
}

export interface AppSettingsFormData {
    app_name?: string;
    app_description?: string;
    tahun_anggaran?: string;
    chat_provider?: string;
    chat_base_url?: string;
    chat_model?: string;
    chat_api_key?: string;
    landing_page_active?: string;
    spm_detail_page_active?: string;
    puspen_progress_fisik_public?: string;
    logo?: File;
    favicon?: File;
}

export interface StorageStats {
    data: {
        foto: number;
        berkas: number;
        database: number;
        media_total: number;
        app_total: number;
    }
}

export interface BackupArchive {
    filename: string;
    size: number;
    last_modified: number | null;
    download_url: string;
}

export interface BackupListResponse {
    data: BackupArchive[];
}

export interface BackupCreateResponse {
    data: {
        filename: string;
        download_url: string;
        size: number;
        include_media: boolean;
        media_files: number;
    };
    message: string;
}

export interface BackupJob {
    job_id: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    filename: string;
    include_media: boolean;
    created_at: string;
    started_at?: string | null;
    finished_at?: string | null;
    message?: string;
    error?: string;
    result?: BackupCreateResponse['data'];
}

export interface BackupJobResponse {
    data: BackupJob;
    message?: string;
}

export interface BackupRestoreResponse {
    data: {
        restored_at: string;
        source: string;
    };
    message: string;
}

// API functions
export const getAppSettings = async (): Promise<AppSettingsResponse> => {
    return api.get<AppSettingsResponse>('/app-settings');
};

export const getStorageStats = async (): Promise<StorageStats> => {
    return api.get<StorageStats>('/app-settings/storage-stats');
};

export const getBackups = async (): Promise<BackupListResponse> => {
    return api.get<BackupListResponse>('/app-settings/backups');
};

export const createBackup = async (includeMedia = true): Promise<BackupJobResponse> => {
    return api.post<BackupJobResponse>('/app-settings/backups', { include_media: includeMedia });
};

export const getBackupJob = async (jobId: string): Promise<BackupJobResponse> => {
    return api.get<BackupJobResponse>(`/app-settings/backups/jobs/${jobId}`);
};

export const downloadBackup = async (filename: string): Promise<Blob> => {
    return api.get<Blob>(`/app-settings/backups/${filename}`, { responseType: 'blob' });
};

export const deleteBackup = async (filename: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/app-settings/backups/${filename}`);
};

export const restoreBackup = async (backupName: string): Promise<BackupRestoreResponse> => {
    return api.post<BackupRestoreResponse>('/app-settings/backups/restore', { backup_name: backupName });
};

export const restoreBackupFromFile = async (backupFile: File): Promise<BackupRestoreResponse> => {
    const formData = new FormData();
    formData.append('backup_file', backupFile);
    return api.post<BackupRestoreResponse>('/app-settings/backups/restore', formData);
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
    if (data.chat_provider !== undefined) {
        formData.append('chat_provider', data.chat_provider);
    }
    if (data.chat_base_url !== undefined) {
        formData.append('chat_base_url', data.chat_base_url);
    }
    if (data.chat_model !== undefined) {
        formData.append('chat_model', data.chat_model);
    }
    if (data.chat_api_key !== undefined && data.chat_api_key.trim()) {
        const apiKey = data.chat_api_key.trim();
        formData.append('chat_api_key', apiKey);
        formData.append('chat_api_key_local', apiKey);
    }
    if (data.landing_page_active !== undefined) {
        formData.append('landing_page_active', data.landing_page_active);
    }
    if (data.spm_detail_page_active !== undefined) {
        formData.append('spm_detail_page_active', data.spm_detail_page_active);
    }
    if (data.puspen_progress_fisik_public !== undefined) {
        formData.append('puspen_progress_fisik_public', data.puspen_progress_fisik_public);
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

export const isSpmDetailPageActive = (settings: AppSetting[] | undefined): boolean => {
    const value = getSettingValue(settings, 'spm_detail_page_active');
    return value === '1' || value === '';
};

export const isSettingConfigured = (settings: AppSetting[] | undefined, key: string): boolean => {
    if (!settings) return false;
    const setting = settings.find(s => s.key === key);
    return setting?.is_configured === true;
};
