import api from '@/lib/api-client';
import type {
    ChecklistContext,
    ChecklistHistoryParams,
    ChecklistHistoryResponse,
    ChecklistItem,
    PekerjaanChecklistParams,
    PekerjaanChecklistResponse,
} from '../types';

// Checklist Items (columns)
export const getChecklistItems = async (context: ChecklistContext = 'pekerjaan') => {
    return api.get<{ data: ChecklistItem[] }>('/checklist-items', { params: { context } });
};

export const createChecklistItem = async (data: { name: string; description?: string; context?: ChecklistContext }) => {
    return api.post<{ data: ChecklistItem }>('/checklist-items', data);
};

export const updateChecklistItem = async (id: number, data: { name?: string; description?: string }) => {
    return api.put<{ data: ChecklistItem }>(`/checklist-items/${id}`, data);
};

export const deleteChecklistItem = async (id: number) => {
    await api.delete(`/checklist-items/${id}`);
};

export const reorderChecklistItems = async (items: { id: number; sort_order: number }[]) => {
    return api.post('/checklist-items/reorder', { items });
};

// Pekerjaan Checklist
export const getPekerjaanChecklist = async (params?: PekerjaanChecklistParams) => {
    return api.get<PekerjaanChecklistResponse>('/pekerjaan-checklist', { params: params as Record<string, any> });
};

export const toggleChecklist = async (data: {
    pekerjaan_id: number;
    checklist_item_id: number;
    is_checked: boolean;
    notes?: string;
}) => {
    return api.post<{
        message: string;
        is_checked: boolean;
        checked_by?: number | null;
        checked_by_name?: string | null;
        updated_at?: string;
    }>('/pekerjaan-checklist/toggle', data);
};

export const getChecklistHistory = async (params?: ChecklistHistoryParams) => {
    return api.get<ChecklistHistoryResponse>('/pekerjaan-checklist/history', {
        params: params as Record<string, string | number | undefined>,
    });
};

export const exportChecklistExcel = async (params?: PekerjaanChecklistParams) => {
    return api.get<Blob>('/pekerjaan-checklist/export/excel', {
        params: params as Record<string, string | number | undefined>,
        responseType: 'blob',
    });
};

export const exportChecklistPdf = async (params?: PekerjaanChecklistParams) => {
    return api.get<Blob>('/pekerjaan-checklist/export/pdf', {
        params: params as Record<string, string | number | undefined>,
        responseType: 'blob',
    });
};
