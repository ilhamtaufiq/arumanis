import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import RegisterDokumen from '@/features/pekerjaan/components/RegisterDokumen'

export const Route = createFileRoute('/_authenticated/pekerjaan/register')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <RegisterDokumen />
        </ProtectedRoute>
    ),
})
