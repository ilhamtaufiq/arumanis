import { ApiError } from '@/lib/api-client.types'

const API_PREFIX = '/bff/api'

export { ApiError } from '@/lib/api-client.types'

type RequestOptions = {
    params?: Record<string, string | number | undefined>
    headers?: Record<string, string>
    responseType?: 'json' | 'blob'
}

async function request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
): Promise<T> {
    let url = `${API_PREFIX}${endpoint}`
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

    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...options.headers,
    }

    let requestBody: BodyInit | undefined
    if (body instanceof FormData) {
        requestBody = body
        delete headers['Content-Type']
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
        requestBody = JSON.stringify(body)
    }

    const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
        credentials: 'include',
    })

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T
    }

    if (options.responseType === 'blob') {
        if (!response.ok) {
            let errorMessage = response.statusText || 'Request failed'
            let errorData: unknown

            try {
                const text = await response.text()
                try {
                    errorData = JSON.parse(text)
                    errorMessage = (errorData as { message?: string; title?: string })?.message
                        || (errorData as { title?: string })?.title
                        || errorMessage
                } catch {
                    if (text.trim()) {
                        errorMessage = text
                    }
                }
            } catch {
                // Keep default error message when body cannot be read.
            }

            throw new ApiError(errorMessage, response.status, errorData)
        }

        return await response.blob() as unknown as T
    }

    let data: unknown
    try {
        data = await response.json()
    } catch {
        if (!response.ok) {
            throw new ApiError(response.statusText || 'Request failed', response.status)
        }
        return undefined as T
    }

    if (!response.ok) {
        const errorMessage = (data as { message?: string; title?: string })?.message
            || (data as { title?: string })?.title
            || 'Request failed'
        throw new ApiError(errorMessage, response.status, data)
    }

    return data as T
}

const api = {
    get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return request<T>('GET', endpoint, undefined, options)
    },

    post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('POST', endpoint, body, options)
    },

    put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('PUT', endpoint, body, options)
    },

    patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('PATCH', endpoint, body, options)
    },

    delete<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('DELETE', endpoint, body, options)
    },
}

export default api