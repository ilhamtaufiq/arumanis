import { createFileRoute } from '@tanstack/react-router'
import WhatsAppDashboard from '@/features/whatsapp/components/WhatsAppDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/whatsapp/')({
    component: () => (
        <ProtectedRoute requiredPath="/whatsapp" requiredMethod="GET">
            <WhatsAppDashboard />
        </ProtectedRoute>
    ),
})
