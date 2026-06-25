import { redirect } from '@tanstack/react-router'
import { fetchSession } from '@/lib/auth-session'

function normalizeRoles(roles: unknown): string[] {
    if (!Array.isArray(roles)) return []

    return roles
        .map((role) => (typeof role === 'string' ? role : role?.name))
        .filter((name): name is string => Boolean(name))
}

export async function requireAuthenticatedSession() {
    const session = await fetchSession()

    if (!session?.user) {
        throw redirect({ to: '/sign-in' })
    }

    const roles = normalizeRoles(session.user.roles)
    if (roles.includes('user') && roles.length === 1) {
        throw redirect({ to: '/unauthorized' })
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