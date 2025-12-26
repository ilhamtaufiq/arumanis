import { createFileRoute } from '@tanstack/react-router'
import NotificationCenterPage from '@/features/notifications/components/NotificationCenterPage'
import PageContainer from '@/components/layout/page-container'

export const Route = createFileRoute('/_authenticated/notifications/')({
    component: NotificationsPage,
})

function NotificationsPage() {
    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <NotificationCenterPage />
            </div>
        </PageContainer>
    )
}
