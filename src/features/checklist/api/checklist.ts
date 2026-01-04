import api from '@/lib/api-client';
import type { ChecklistItem, PekerjaanChecklistResponse } from '../types';

// Checklist Items (columns)
export const getChecklistItems = async () => {
    return api.get<{ data: ChecklistItem[] }>('/checklist-items');
};

export const createChecklistItem = async (data: { name: string; description?: string }) => {
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
export const getPekerjaanChecklist = async (params?: {
    tahun?: string;
    kegiatan_id?: number;
    search?: string
}) => {
    return api.get<PekerjaanChecklistResponse>('/pekerjaan-checklist', { params });
};

export const toggleChecklist = async (data: {
    pekerjaan_id: number;
    checklist_item_id: number;
    is_checked: boolean;
    notes?: string;
}) => {
    return api.post<{ message: string; is_checked: boolean }>('/pekerjaan-checklist/toggle', data);
};
