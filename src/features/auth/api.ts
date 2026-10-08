import { invalidateSessionCache } from '@/lib/auth-session'
import type { LoginRequest, LoginResponse, User } from './types'

const AUTH_PREFIX = '/api/auth'

async function authJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${AUTH_PREFIX}${path}`, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...init,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
        throw Object.assign(new Error(payload?.message || 'Request failed'), {
            response: { status: response.status, data: payload },
        })
    }

    return payload as T
}

/**
 * Login dengan email dan password. Sesi dikirim sebagai cookie httpOnly oleh server.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const payload = await authJson<{ user: User }>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    })

    return {
        user: payload.user,
        token: 'session',
    }
}

/**
 * Logout user saat ini dan hapus cookie sesi.
 */
export async function logout(): Promise<void> {
    await authJson('/logout', { method: 'POST' })
    invalidateSessionCache()
}

/**
 * User yang sedang login. Melempar error (401) bila belum login.
 */
export async function getCurrentUser(): Promise<User> {
    const payload = await authJson<{ data: User }>('/me')
    return payload.data
}

/**
 * Menukar token dari alur OAuth menjadi cookie sesi.
 */
export async function syncAuthToken(token: string): Promise<void> {
    await authJson('/sync-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
    })
}

/**
 * URL redirect Google OAuth (Laravel).
 */
export async function getGoogleAuthUrl(): Promise<{ url: string }> {
    const response = await fetch('/api/auth/google', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    })
    return response.json()
}
