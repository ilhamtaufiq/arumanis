import api from '@/lib/api-client';
import type { AuditLog, AuditLogParams } from '../types';

export const getAuditLogs = async (params: AuditLogParams = {}) => {
    const response = await api.get<{ data: AuditLog[]; meta: any }>('/audit-logs', {
        params: params as any
    });
    return response;
};

export const getAuditLog = async (id: number) => {
    const response = await api.get<{ data: AuditLog }>(`/audit-logs/${id}`);
    return response.data;
};
