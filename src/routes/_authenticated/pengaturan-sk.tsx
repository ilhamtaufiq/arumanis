import { createFileRoute, redirect } from '@tanstack/react-router'
import SkPage from '@/features/pengaturan-sk/components/SkPage'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/pengaturan-sk')({
    beforeLoad: () => {
        const { auth } = useAuthStore.getState()
        const isAdmin = auth.user?.roles?.some((role: { name?: string } | string) =>
            typeof role === 'string' ? role === 'admin' : role.name === 'admin',
        )
        if (!isAdmin) {
            throw redirect({ to: '/dashboard' })
        }
    },
    component: SkPage,
})
