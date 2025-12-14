import api from '@/lib/api-client';
import type { ProgressReportResponse } from '../types';

/**
 * Get progress report for a pekerjaan
 */
export async function getProgressReport(pekerjaanId: number): Promise<ProgressReportResponse> {
    return api.get<ProgressReportResponse>(`/progress/pekerjaan/${pekerjaanId}`);
}

/**
 * Save full progress report
 */
export async function saveProgressReport(pekerjaanId: number, data: unknown): Promise<void> {
    await api.post(`/progress/pekerjaan/${pekerjaanId}`, data);
}
