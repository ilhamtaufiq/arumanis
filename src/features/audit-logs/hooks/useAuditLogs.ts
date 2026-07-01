import { useQuery } from '@tanstack/react-query'
import { getAuditLog, getAuditLogs } from '../api'
import type { AuditLogParams } from '../types'

export const auditLogKeys = {
    all: ['audit-logs'] as const,
    lists: () => [...auditLogKeys.all, 'list'] as const,
    list: (params: AuditLogParams) => [...auditLogKeys.all, 'list', params] as const,
    detail: (id: number) => [...auditLogKeys.all, 'detail', id] as const,
}

export function useAuditLogsList(params: AuditLogParams, enabled = true) {
    return useQuery({
        queryKey: auditLogKeys.list(params),
        queryFn: () => getAuditLogs(params),
        enabled,
    })
}

export function useAuditLogDetail(id: number, enabled = true) {
    return useQuery({
        queryKey: auditLogKeys.detail(id),
        queryFn: () => getAuditLog(id),
        enabled: enabled && id > 0,
    })
}