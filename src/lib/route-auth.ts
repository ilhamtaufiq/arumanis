import { redirect } from '@tanstack/react-router'
import { fetchSession, invalidateSessionCache } from '@/lib/auth-session'
import { isPublicOnlyUser } from '@/lib/post-login-redirect'

/**
 * Guard for authenticated routes.
 * Uses the session cache (default 30s) so preload/hover and child navigations
 * do not hammer GET /bff/auth/me. Pass force only after login/logout/401.
 */
export async function requireAuthenticatedSession(options?: { force?: boolean }) {
    const session = await fetchSession({ force: options?.force === true })

    if (!session?.user) {
        invalidateSessionCache()
        throw redirect({
            to: '/sign-in',
            search: {
                redirect: typeof window !== 'undefined' ? window.location.pathname : undefined,
            },
        })
    }

    if (isPublicOnlyUser(session.user.roles)) {
        throw redirect({ to: '/' })
    }

    return session
}

export async function requireAnySession() {
    const session = await fetchSession()

    if (!session?.user) {
        throw redirect({ to: '/sign-in' })
    }

    return session
}
