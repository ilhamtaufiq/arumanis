import { createFileRoute, redirect } from '@tanstack/react-router'
import { AssignmentManager } from '@/features/user-pekerjaan/components/AssignmentManager'
import PageContainer from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/user-pekerjaan/')({
    beforeLoad: () => {
        const { auth } = useAuthStore.getState()
        const isAdmin = auth.user?.roles?.some((role: string | { name: string }) =>
            typeof role === 'string' ? role === 'admin' : role.name === 'admin',
        )

        if (!isAdmin) {
            throw redirect({ to: '/dashboard' })
        }
    },
    component: UserPekerjaanPage,
})

function UserPekerjaanPage() {
    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <AssignmentManager />
            </div>
        </PageContainer>
    )
}