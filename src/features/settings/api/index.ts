import api from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { EmailTemplateDraft, EmailTemplateKey, EmailTemplateMeta } from '../constants/email-templates';
import type { KontrakTemplateFormField, KontrakTemplateMeta } from '../constants/kontrak-templates';

// Types
export interface AppSetting {
    id: number;
    key: string;
    value: string | null;
    type: 'text' | 'file' | 'secret';
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
    capaian_publik_section_active?: string;
    puspen_progress_fisik_public?: string;
    maintenance_mode?: string;
    maintenance_bypass_emails?: string;
    mail_enabled?: string;
    mail_host?: string;
    mail_port?: string;
    mail_encryption?: string;
    mail_username?: string;
    mail_password?: string;
    mail_from_address?: string;
    mail_from_name?: string;
    contact_email?: string;
    kontrak_nama_ppk?: string;
    kontrak_nip_ppk?: string;
    kontrak_nama_pptk?: string;
    kontrak_nip_pptk?: string;
    kontrak_masa_pemeliharaan_hari?: string;
    kontrak_skpd?: string;
    kontrak_nomor_dpa?: string;
    kontrak_tanggal_dpa?: string;
    kontrak_cara_pembayaran?: string;
    kontrak_template_spk?: File;
    kontrak_template_ringkasan?: File;
    kontrak_template_bap?: File;
    kontrak_template_cover_am?: File;
    kontrak_template_cover_san?: File;
    logo?: File;
    favicon?: File;
}

export interface KontrakTemplatesResponse {
    data: KontrakTemplateMeta[];
}

export interface MailTemplatesResponse {
    data: EmailTemplateMeta[];
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
    /** 0–100 when backend reports progress (multi-GB media packaging). */
    progress?: number;
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

export type MaintenanceStatusResponse = {
    data: {
        enabled: boolean
        bypass: boolean
        can_access: boolean
        message?: string | null
    }
}

export const getMaintenanceStatus = async (): Promise<MaintenanceStatusResponse['data']> => {
    const response = await api.get<MaintenanceStatusResponse>('/app-settings/maintenance')
    return response.data
}

export const getKontrakTemplates = async (): Promise<KontrakTemplatesResponse> => {
    return api.get<KontrakTemplatesResponse>('/app-settings/kontrak-templates');
};

export const getMailTemplates = async (): Promise<MailTemplatesResponse> => {
    return api.get<MailTemplatesResponse>('/app-settings/mail-templates');
};

export const saveMailTemplates = async (
    templates: Record<string, EmailTemplateDraft>
): Promise<MailTemplatesResponse> => {
    return api.post<MailTemplatesResponse>('/app-settings/mail-templates', { templates });
};

export const testMailTemplate = async (
    key: EmailTemplateKey,
    to: string,
    draft: EmailTemplateDraft
): Promise<{ ok: boolean; error?: string; format?: string }> => {
    return api.post(`/app-settings/mail-templates/${key}/test`, {
        to: to.trim(),
        format: draft.format,
        subject: draft.subject,
        body: draft.body,
    });
};

export const downloadKontrakDocTemplate = async (key: string): Promise<Blob> => {
    return api.get<Blob>(`/app-settings/kontrak-templates/${key}/download`, {
        responseType: 'blob',
    });
};

export const uploadKontrakTemplate = async (
    field: KontrakTemplateFormField,
    file: File,
): Promise<AppSettingsResponse> => {
    return updateAppSettings({ [field]: file });
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

/**
 * Same-origin BFF URL for streaming backup download.
 * Use browser-native download (anchor / location) — never fetch()+blob() for multi-GB zips
 * or the whole archive is buffered in JS heap and will OOM / 502.
 */
export const getBackupDownloadUrl = (filename: string): string => {
    return `/bff/api/app-settings/backups/${encodeURIComponent(filename)}`
}

/** @deprecated Prefer getBackupDownloadUrl + native browser download for large archives. */
export const downloadBackup = async (filename: string): Promise<Blob> => {
    return api.get<Blob>(`/app-settings/backups/${encodeURIComponent(filename)}`, { responseType: 'blob' });
};

/** Trigger browser-managed download (streams to disk; works for 3GB+). */
export const triggerBackupDownload = (filename: string): void => {
    const link = document.createElement('a')
    link.href = getBackupDownloadUrl(filename)
    link.download = filename
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
}

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
    if (data.capaian_publik_section_active !== undefined) {
        formData.append('capaian_publik_section_active', data.capaian_publik_section_active);
    }
    if (data.puspen_progress_fisik_public !== undefined) {
        formData.append('puspen_progress_fisik_public', data.puspen_progress_fisik_public);
    }
    if (data.maintenance_mode !== undefined) {
        formData.append('maintenance_mode', data.maintenance_mode);
    }
    if (data.maintenance_bypass_emails !== undefined) {
        formData.append('maintenance_bypass_emails', data.maintenance_bypass_emails);
    }
    if (data.mail_enabled !== undefined) {
        formData.append('mail_enabled', data.mail_enabled);
    }
    if (data.mail_host !== undefined) {
        formData.append('mail_host', data.mail_host);
    }
    if (data.mail_port !== undefined) {
        formData.append('mail_port', data.mail_port);
    }
    if (data.mail_encryption !== undefined) {
        formData.append('mail_encryption', data.mail_encryption);
    }
    if (data.mail_username !== undefined) {
        formData.append('mail_username', data.mail_username);
    }
    if (data.mail_password !== undefined && data.mail_password.trim()) {
        formData.append('mail_password', data.mail_password.trim());
    }
    if (data.mail_from_address !== undefined) {
        formData.append('mail_from_address', data.mail_from_address);
    }
    if (data.mail_from_name !== undefined) {
        formData.append('mail_from_name', data.mail_from_name);
    }
    if (data.contact_email !== undefined) {
        formData.append('contact_email', data.contact_email);
    }
    if (data.kontrak_nama_ppk !== undefined) {
        formData.append('kontrak_nama_ppk', data.kontrak_nama_ppk);
    }
    if (data.kontrak_nip_ppk !== undefined) {
        formData.append('kontrak_nip_ppk', data.kontrak_nip_ppk);
    }
    if (data.kontrak_nama_pptk !== undefined) {
        formData.append('kontrak_nama_pptk', data.kontrak_nama_pptk);
    }
    if (data.kontrak_nip_pptk !== undefined) {
        formData.append('kontrak_nip_pptk', data.kontrak_nip_pptk);
    }
    if (data.kontrak_masa_pemeliharaan_hari !== undefined) {
        formData.append('kontrak_masa_pemeliharaan_hari', data.kontrak_masa_pemeliharaan_hari);
    }
    if (data.kontrak_skpd !== undefined) {
        formData.append('kontrak_skpd', data.kontrak_skpd);
    }
    if (data.kontrak_nomor_dpa !== undefined) {
        formData.append('kontrak_nomor_dpa', data.kontrak_nomor_dpa);
    }
    if (data.kontrak_tanggal_dpa !== undefined) {
        formData.append('kontrak_tanggal_dpa', data.kontrak_tanggal_dpa);
    }
    if (data.kontrak_cara_pembayaran !== undefined) {
        formData.append('kontrak_cara_pembayaran', data.kontrak_cara_pembayaran);
    }
    if (data.kontrak_template_spk) {
        formData.append('kontrak_template_spk', data.kontrak_template_spk);
    }
    if (data.kontrak_template_ringkasan) {
        formData.append('kontrak_template_ringkasan', data.kontrak_template_ringkasan);
    }
    if (data.kontrak_template_bap) {
        formData.append('kontrak_template_bap', data.kontrak_template_bap);
    }
    if (data.kontrak_template_cover_am) {
        formData.append('kontrak_template_cover_am', data.kontrak_template_cover_am);
    }
    if (data.kontrak_template_cover_san) {
        formData.append('kontrak_template_cover_san', data.kontrak_template_cover_san);
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
export const useAppSettings = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['app-settings'],
        queryFn: getAppSettings,
        enabled: options?.enabled ?? true,
        staleTime: 10 * 60 * 1000,
    });
};

export const useKontrakTemplates = () => {
    return useQuery({
        queryKey: ['kontrak-templates'],
        queryFn: getKontrakTemplates,
    });
};

export const useMailTemplates = () => {
    return useQuery({
        queryKey: ['mail-templates'],
        queryFn: getMailTemplates,
    });
};

export const useUpdateAppSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAppSettings,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['app-settings'] });
            queryClient.invalidateQueries({ queryKey: ['app-settings-maintenance'] });
            const { invalidateMaintenanceCache } = await import('@/lib/maintenance-session')
            invalidateMaintenanceCache()
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

/** Landing page section "Capaian Publik" (#capaian-spm). Default on when unset. */
export const isCapaianPublikSectionActive = (settings: AppSetting[] | undefined): boolean => {
    const value = getSettingValue(settings, 'capaian_publik_section_active');
    return value === '1' || value === '';
};

export const isSettingConfigured = (settings: AppSetting[] | undefined, key: string): boolean => {
    if (!settings) return false;
    const setting = settings.find(s => s.key === key);
    return setting?.is_configured === true;
};
