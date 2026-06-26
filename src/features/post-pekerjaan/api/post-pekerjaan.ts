import api from '@/lib/api-client'
import { toggleChecklist } from '@/features/checklist/api/checklist'
import type { PostPekerjaanParams, PostPekerjaanResponse } from '../types'

export async function getPostPekerjaanChecklist(params?: PostPekerjaanParams) {
    return api.get<PostPekerjaanResponse>('/post-pekerjaan-checklist', {
        params: params as Record<string, string | number | undefined>,
    })
}

export { toggleChecklist as togglePostPekerjaanChecklist }