import { createFileRoute, redirect } from '@tanstack/react-router'
import BroadcastNotificationForm from '@/features/notifications/components/BroadcastNotificationForm'
import PageContainer from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/notifications/broadcast')({
    beforeLoad: () => {
        const { auth } = useAuthStore.getState()
        const isAdmin = auth.user?.roles?.some((role: any) =>
            typeof role === 'string' ? role === 'admin' : role.name === 'admin'
        )
        if (!isAdmin) {
            throw redirect({
                to: '/',
            })
        }
    },
    component: BroadcastNotificationPage,
})

function BroadcastNotificationPage() {
    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <BroadcastNotificationForm />
            </div>
        </PageContainer>
    )
}
