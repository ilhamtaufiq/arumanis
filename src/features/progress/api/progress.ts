import api from '@/lib/axios';
import type {
    ProgressReportResponse,
    CreateProgressItemPayload,
    StoreWeeklyProgressPayload
} from '../types';

/**
 * Get progress report for a pekerjaan
 */
export async function getProgressReport(pekerjaanId: number): Promise<ProgressReportResponse> {
    const response = await api.get<ProgressReportResponse>(`/progress/pekerjaan/${pekerjaanId}`);
    return response.data;
}

/**
 * Create a new progress item
 */
export async function createProgressItem(payload: CreateProgressItemPayload): Promise<void> {
    await api.post('/progress/items', payload);
}

/**
 * Delete a progress item
 */
export async function deleteProgressItem(itemId: number): Promise<void> {
    await api.delete(`/progress/items/${itemId}`);
}

/**
 * Store/update weekly progress
 */
export async function storeWeeklyProgress(payload: StoreWeeklyProgressPayload): Promise<void> {
    await api.post('/progress/weekly', payload);
}
