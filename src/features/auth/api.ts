import { invalidateSessionCache } from '@/lib/auth-session'
import type { LoginRequest, LoginResponse, User } from './types'

async function bffJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, {
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
 * Login user with email and password (dev/local BFF only).
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const payload = await bffJson<{ user: User }>('/bff/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    })

    return {
        user: payload.user,
        token: 'session',
    }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
    await bffJson('/bff/auth/logout', { method: 'POST' })
    invalidateSessionCache()
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
    const payload = await bffJson<{ user: User }>('/bff/auth/me')
    return payload.user
}

/**
 * Sync bearer token into httpOnly session cookie
 */
export async function syncAuthToken(token: string): Promise<void> {
    await bffJson('/bff/auth/sync-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
    })
}

/**
 * Get Google OAuth redirect URL
 */
export async function getGoogleAuthUrl(): Promise<{ url: string }> {
    const response = await fetch('/bff/api/auth/google', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    })
    return response.json()
}