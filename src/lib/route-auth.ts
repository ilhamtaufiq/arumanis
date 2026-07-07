import { redirect } from '@tanstack/react-router'
import { fetchSession, invalidateSessionCache } from '@/lib/auth-session'
import { isPublicOnlyUser } from '@/lib/post-login-redirect'

export async function requireAuthenticatedSession() {
    const session = await fetchSession({ force: true })

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