import api from '@/lib/api-client'
import type { ErrorLog, ErrorLogParams, ErrorLogResponse } from '../types'

export const getErrorLogs = async (params: ErrorLogParams = {}) => {
    return api.get<ErrorLogResponse>('/error-logs', {
        params: params as Record<string, string | number | undefined>,
    })
}

export const getErrorLog = async (id: number) => {
    const response = await api.get<{ success: boolean; data: ErrorLog }>(`/error-logs/${id}`)
    return response.data
}

export const resolveErrorLog = async (id: number) => {
    const response = await api.post<{ success: boolean; data: ErrorLog }>(`/error-logs/${id}/resolve`)
    return response.data
}

export const reopenErrorLog = async (id: number) => {
    const response = await api.post<{ success: boolean; data: ErrorLog }>(`/error-logs/${id}/reopen`)
    return response.data
}
