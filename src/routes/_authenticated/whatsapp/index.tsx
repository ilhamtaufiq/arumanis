import { createFileRoute, redirect } from '@tanstack/react-router'
import WhatsAppDashboard from '@/features/whatsapp/components/WhatsAppDashboard'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/whatsapp/')({
    beforeLoad: () => {
        const { auth } = useAuthStore.getState()
        const isAdmin = auth.user?.roles?.some((role: { name?: string } | string) =>
            typeof role === 'string' ? role === 'admin' : role.name === 'admin',
        )
        if (!isAdmin) {
            throw redirect({ to: '/dashboard' })
        }
    },
    component: WhatsAppDashboard,
})
