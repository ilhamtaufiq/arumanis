import api from '@/lib/api-client';
import type { 
    UnitSpam, 
    UnitSpamResponse, 
    UnitSpamStats,
    SpamUnitFilters,
    SpamIntegrationFilters,
    SpamIntegrationOutputOption,
    SpamIntegrationResponse,
    SpamDesaIntegration,
    SpamAirMinumPekerjaanFilters,
    IntegrationPekerjaan,
    SyncMode,
} from '../types';
import type {
    KelembagaanFormFields,
    KelembagaanPublicFormData,
    KelembagaanShareLink,
    KelembagaanSubmission,
    KelembagaanSubmissionStatus,
} from '../types/share'

export const importSpamData = async (file: File): Promise<{message: string, output: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<{message: string, output: string}>('/spam-units/import', formData);
};

export const getSpamUnits = async (params?: SpamUnitFilters) => {
    return api.get<UnitSpamResponse>('/spam-units', { 
        params: {
            ...params,
            _t: Date.now()
        } 
    });
};

export const getSpamUnit = async (id: number) => {
    return api.get<{ success: boolean; data: UnitSpam }>(`/spam-units/${id}?_t=${Date.now()}`);
};

export const getSpamUnitStats = async (params?: { kecamatan_id?: number; tahun?: string }) => {
    return api.get<{ success: boolean; data: UnitSpamStats }>('/spam-units/stats', { 
        params: {
            ...params,
            _t: Date.now()
        } 
    });
};

export const createSpamUnit = async (data: Omit<UnitSpam, 'id' | 'created_at' | 'updated_at' | 'desa' | 'pengelola' | 'achievements' | 'checklists'> & {
    pokmas?: string;
    perdes?: string;
    kepala?: string;
    bendahara?: string;
    sekretaris?: string;
}) => {
    return api.post<{ success: boolean; data: UnitSpam }>('/spam-units', data);
};

export const updateSpamUnit = async (id: number, data: Partial<Omit<UnitSpam, 'id' | 'created_at' | 'updated_at' | 'desa' | 'pengelola' | 'achievements' | 'checklists'>> & {
    pokmas?: string;
    perdes?: string;
    kepala?: string;
    bendahara?: string;
    sekretaris?: string;
}) => {
    return api.put<{ success: boolean; data: UnitSpam }>(`/spam-units/${id}`, data);
};

export const deleteSpamUnit = async (id: number) => {
    await api.delete(`/spam-units/${id}`);
};

export const createSpamAchievement = async (unitSpamId: number, data: {
    tahun: string;
    jumlah_sr: number;
    jumlah_kk: number;
    jumlah_jiwa: number;
    jumlah_bjp_kk?: number;
    jumlah_bjp_jiwa?: number;
    catatan?: string;
}) => {
    return api.post<{ success: boolean; data: any }>(`/spam-units/${unitSpamId}/achievements`, data);
};

export const createSpamBudget = async (unitSpamId: number, data: {
    tahun: string;
    nilai_kontrak: number;
    nama_paket?: string;
    sumber_dana?: string;
}) => {
    return api.post<{ success: boolean; data: any }>(`/spam-units/${unitSpamId}/budgets`, data);
};

export const deleteSpamBudget = async (unitSpamId: number, budgetId: number) => {
    return api.delete(`/spam-units/${unitSpamId}/budgets/${budgetId}`);
};

export const getSpamIntegration = async (params?: SpamIntegrationFilters) => {
    return api.get<SpamIntegrationResponse>('/spam-units/integration', {
        params: {
            ...params,
            _t: Date.now(),
        },
    });
};

export const getSpamIntegrationOutputOptions = async (params?: {
    tahun?: string;
    kecamatan_id?: number;
}) => {
    return api.get<{ success: boolean; data: SpamIntegrationOutputOption[] }>(
        '/spam-units/integration/output-options',
        {
            params: {
                ...params,
                _t: Date.now(),
            },
        }
    );
};

export const getSpamIntegrationByDesa = async (
    desaId: number,
    params?: { tahun?: string; output_type?: string; komponen?: string }
) => {
    return api.get<{ success: boolean; data: SpamDesaIntegration }>(
        `/spam-units/integration/desa/${desaId}`,
        {
            params: {
                ...params,
                _t: Date.now(),
            },
        }
    );
};

export const getSpamAirMinumPekerjaan = async (params?: SpamAirMinumPekerjaanFilters) => {
    return api.get<{
        success: boolean;
        data: IntegrationPekerjaan[];
        meta: { current_page: number; last_page: number; per_page: number; total: number };
    }>('/spam-units/air-minum-pekerjaan', {
        params: {
            ...params,
            _t: Date.now(),
        },
    });
};

export const attachSpamPekerjaan = async (
    unitSpamId: number,
    data: { pekerjaan_id: number; output_id?: number; capaian_metric?: 'jp' | 'bjp' }
) => {
    return api.post<{ success: boolean; message: string; data: UnitSpam }>(
        `/spam-units/${unitSpamId}/pekerjaan`,
        data
    );
};

export const detachSpamPekerjaan = async (unitSpamId: number, pekerjaanId: number) => {
    return api.delete<{ success: boolean; message: string; data: UnitSpam }>(
        `/spam-units/${unitSpamId}/pekerjaan/${pekerjaanId}`
    );
};

export const syncSpamFromPekerjaan = async (
    unitSpamId: number,
    data: { tahun: string; mode: SyncMode }
) => {
    return api.post<{ success: boolean; message: string; data?: unknown }>(
        `/spam-units/${unitSpamId}/sync-pekerjaan`,
        data
    );
};

// ── Share form kelembagaan (admin + public) ───────────────────────────

export const createKelembagaanShareLink = async (data: {
    unit_spam_id: number
    label?: string
    expires_at?: string
    max_submissions?: number
    admin_note?: string
}) => {
    return api.post<{ success: boolean; message: string; data: KelembagaanShareLink }>(
        '/spam-kelembagaan/share-links',
        data,
    )
}

export const getKelembagaanShareLinks = async (params?: {
    unit_spam_id?: number
    is_active?: boolean | string
    page?: number
    per_page?: number
}) => {
    return api.get<{
        success: boolean
        data: KelembagaanShareLink[]
        meta: { current_page: number; last_page: number; per_page: number; total: number }
    }>('/spam-kelembagaan/share-links', { params })
}

export const updateKelembagaanShareLink = async (
    id: number,
    data: Partial<{
        label: string
        is_active: boolean
        expires_at: string | null
        max_submissions: number | null
        admin_note: string
    }>,
) => {
    return api.put<{ success: boolean; data: KelembagaanShareLink }>(
        `/spam-kelembagaan/share-links/${id}`,
        data,
    )
}

export const deactivateKelembagaanShareLink = async (id: number) => {
    return api.delete<{ success: boolean; message: string }>(`/spam-kelembagaan/share-links/${id}`)
}

export const getKelembagaanSubmissions = async (params?: {
    status?: KelembagaanSubmissionStatus | string
    unit_spam_id?: number
    page?: number
    per_page?: number
}) => {
    return api.get<{
        success: boolean
        data: KelembagaanSubmission[]
        meta: {
            current_page: number
            last_page: number
            per_page: number
            total: number
            pending_count?: number
        }
    }>('/spam-kelembagaan/submissions', { params })
}

export const approveKelembagaanSubmission = async (id: number, review_note?: string) => {
    return api.post<{ success: boolean; message: string; data: KelembagaanSubmission }>(
        `/spam-kelembagaan/submissions/${id}/approve`,
        { review_note },
    )
}

export const rejectKelembagaanSubmission = async (id: number, review_note?: string) => {
    return api.post<{ success: boolean; message: string; data: KelembagaanSubmission }>(
        `/spam-kelembagaan/submissions/${id}/reject`,
        { review_note },
    )
}

export const getPublicKelembagaanForm = async (token: string) => {
    return api.get<{ success: boolean; message?: string; data: KelembagaanPublicFormData }>(
        `/public/spam-kelembagaan/form/${token}`,
    )
}

export const submitPublicKelembagaanForm = async (
    token: string,
    data: {
        payload: KelembagaanFormFields
        submitter_name: string
        submitter_phone?: string
        submitter_instansi?: string
        submitter_note?: string
    },
) => {
    return api.post<{
        success: boolean
        message: string
        data: { id: number; status: string; created_at?: string }
    }>(`/public/spam-kelembagaan/form/${token}`, data)
}
