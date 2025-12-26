import { useAuthStore } from '@/stores/auth-stores';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apiamis.test/api';

export class ApiError extends Error {
    status: number;
    data?: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

type RequestOptions = {
    params?: Record<string, string | number | undefined>;
    headers?: Record<string, string>;
    responseType?: 'json' | 'blob';
};

async function request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
): Promise<T> {
    const token = useAuthStore.getState().auth.accessToken;

    // Build URL with query params
    let url = `${BASE_URL}${endpoint}`;
    if (options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    // Build headers
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Handle body - FormData or JSON
    let requestBody: BodyInit | undefined;
    if (body instanceof FormData) {
        requestBody = body;
        // Don't set Content-Type for FormData, browser will set it with boundary
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
    });

    // Handle empty responses (204 No Content, etc.)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
    }

    if (options.responseType === 'blob') {
        if (!response.ok) {
            throw new ApiError(response.statusText || 'Request failed', response.status);
        }
        return await response.blob() as unknown as T;
    }

    // Try to parse JSON response
    let data: unknown;
    try {
        data = await response.json();
    } catch {
        // Response is not JSON
        if (!response.ok) {
            throw new ApiError(response.statusText || 'Request failed', response.status);
        }
        return undefined as T;
    }

    if (!response.ok) {
        const errorMessage = (data as { message?: string; title?: string })?.message
            || (data as { title?: string })?.title
            || 'Request failed';
        throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
}

// API methods
const api = {
    get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return request<T>('GET', endpoint, undefined, options);
    },

    post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('POST', endpoint, body, options);
    },

    put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('PUT', endpoint, body, options);
    },

    patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('PATCH', endpoint, body, options);
    },

    delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return request<T>('DELETE', endpoint, undefined, options);
    },
};

export default api;
