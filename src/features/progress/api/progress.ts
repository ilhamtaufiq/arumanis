import api from '@/lib/axios';
import type { ProgressReportResponse } from '../types';

/**
 * Get progress report for a pekerjaan
 */
export async function getProgressReport(pekerjaanId: number): Promise<ProgressReportResponse> {
    const response = await api.get<ProgressReportResponse>(`/progress/pekerjaan/${pekerjaanId}`);
    return response.data;
}

/**
 * Save full progress report
 */
export async function saveProgressReport(pekerjaanId: number, data: any): Promise<void> {
    await api.post(`/progress/pekerjaan/${pekerjaanId}`, data);
}
