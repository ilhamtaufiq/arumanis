import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import type { AuditLog } from '../types/audit';

export const auditLogKeys = {
    all: ['audit-logs'] as const,
    lists: () => [...auditLogKeys.all, 'list'] as const,
    list: (params: any) => [...auditLogKeys.lists(), params] as const,
};

export const getAuditLogs = async (params: any = {}): Promise<{ data: AuditLog[], meta: any }> => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
};

export const useAuditLogs = (params: any = {}) => {
    return useQuery({
        queryKey: auditLogKeys.list(params),
        queryFn: () => getAuditLogs(params),
    });
};
