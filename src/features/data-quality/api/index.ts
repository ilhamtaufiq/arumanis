import api from '@/lib/api-client'
import type {
    ActionInboxResponse,
    DataQualityIssue,
    DataQualityItemsResponse,
} from '../types'

export async function getDataQualityItems(params: {
    issue: DataQualityIssue
    tahun?: string | number
    search?: string
    page?: number
    per_page?: number
}) {
    return api.get<DataQualityItemsResponse>('/data-quality/items', { params })
}

export async function getActionInbox(tahun?: string | number) {
    return api.get<ActionInboxResponse>('/data-quality/action-inbox', {
        params: { tahun },
    })
}
