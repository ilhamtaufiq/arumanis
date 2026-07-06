import { ApiError } from '@/lib/api-client.types'

const SIPD_PREFIX = '/bff/sipd'

type RequestOptions = {
    params?: Record<string, string | number | undefined>
}

async function sipdRequest<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {},
): Promise<T> {
    let url = `${SIPD_PREFIX}${endpoint}`
    if (options.params) {
        const searchParams = new URLSearchParams()
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value))
            }
        })
        const queryString = searchParams.toString()
        if (queryString) {
            url += `?${queryString}`
        }
    }

    const response = await fetch(url, {
        method,
        headers: { Accept: 'application/json' },
        credentials: 'include',
    })

    if (response.status === 204) {
        return undefined as T
    }

    let payload: unknown = null
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        payload = await response.json().catch(() => null)
    } else {
        const text = await response.text().catch(() => '')
        payload = text || null
    }

    if (!response.ok) {
        const message = (payload as { message?: string; detail?: string })?.message
            || (payload as { detail?: string })?.detail
            || response.statusText
            || 'Request failed'
        throw new ApiError(message, response.status, payload)
    }

    return payload as T
}

export const sipdClient = {
    get: <T>(endpoint: string, options?: RequestOptions) => sipdRequest<T>('GET', endpoint, options),
}