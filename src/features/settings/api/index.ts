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
    openrouter_model?: string;
    landing_page_active?: string;
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
    if (data.openrouter_model !== undefined) {
        formData.append('openrouter_model', data.openrouter_model);
    }
    if (data.landing_page_active !== undefined) {
        formData.append('landing_page_active', data.landing_page_active);
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
