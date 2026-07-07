import { ApiError } from '@/lib/api-client.types'
import { fetchSession } from '@/lib/auth-session'

const SIPD_PREFIX = '/bff/sipd'

type RequestOptions = {
    params?: Record<string, string | number | undefined>
    _retryAfterSessionRefresh?: boolean
}

function buildSipdUrl(endpoint: string, params?: RequestOptions['params']) {
    let url = `${SIPD_PREFIX}${endpoint}`
    if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value))
            }
        })
        const queryString = searchParams.toString()
        if (queryString) {
            url += `?${queryString}`
        }
    }
    return url
}

function isBffSessionError(payload: unknown, status: number) {
    if (status !== 401) return false
    const code = (payload as { code?: string } | null)?.code
    return code === 'BFF_NO_SESSION' || code === 'BFF_INVALID_SESSION'
}

async function sipdRequest<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {},
): Promise<T> {
    const url = buildSipdUrl(endpoint, options.params)

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
        if (
            response.status === 502
            && /error code:\s*502/i.test(text)
        ) {
            payload = {
                message: 'Server Arumanis crash/timeout saat memanggil SIPD (Cloudflare 502).',
                cloudflare_error: true,
            }
        } else {
            payload = text || null
        }
    }

    if (!response.ok) {
        if (
            !options._retryAfterSessionRefresh
            && isBffSessionError(payload, response.status)
        ) {
            await fetchSession({ force: true })
            return sipdRequest<T>(method, endpoint, {
                ...options,
                _retryAfterSessionRefresh: true,
            })
        }

        const record = payload as {
            message?: string
            detail?: string
            code?: string
            cloudflare_error?: boolean
        } | null

        const message = record?.cloudflare_error
            ? 'Server Arumanis crash/timeout saat memanggil SIPD (Cloudflare 502). Set SIPD_SERVICE_TOKEN di Coolify lalu redeploy.'
            : record?.message
            || record?.detail
            || response.statusText
            || 'Request failed'
        throw new ApiError(message, response.status, payload)
    }

    return payload as T
}

export const sipdClient = {
    get: <T>(endpoint: string, options?: RequestOptions) => sipdRequest<T>('GET', endpoint, options),
}