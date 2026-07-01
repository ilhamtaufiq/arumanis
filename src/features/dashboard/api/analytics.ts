import type { ActiveVisitorsResponse } from '../types/analytics'

export async function getActiveVisitors(): Promise<ActiveVisitorsResponse> {
    const response = await fetch('/bff/analytics/realtime', {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
        },
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
        throw Object.assign(new Error(payload?.message || 'Request failed'), {
            response: { status: response.status, data: payload },
        })
    }

    return payload as ActiveVisitorsResponse
}