import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-stores'

type RoleLike = string | { name: string }

export function isAdminUser(roles?: RoleLike[] | null): boolean {
    if (!roles?.length) return false
    return roles.some((role) => (typeof role === 'string' ? role : role.name) === 'admin')
}

export function requireAdmin() {
    const { auth } = useAuthStore.getState()
    if (!isAdminUser(auth?.user?.roles)) {
        throw redirect({ to: '/dashboard' })
    }
}