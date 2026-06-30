import api from '@/lib/api-client'
import type { OnlineUsersResponse } from '../types/presence'

export const sendPresenceHeartbeat = async (app: 'portal' | 'pengawasan' = 'portal') => {
    return api.post<{ data: { ok: boolean; online_window_minutes: number } }>('/presence/heartbeat', { app })
}

export const getOnlineUsers = async () => {
    return api.get<OnlineUsersResponse>('/presence/online')
}