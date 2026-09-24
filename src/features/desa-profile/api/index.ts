import api from '@/lib/api-client'
import type { DesaProfileResponse } from '../types'

export const getDesaProfile = async (id: number) => {
  return api.get<DesaProfileResponse>(`/desa/${id}/profile`)
}