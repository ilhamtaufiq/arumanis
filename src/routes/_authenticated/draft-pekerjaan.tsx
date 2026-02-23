import { createFileRoute } from '@tanstack/react-router'
import DraftPekerjaanList from '@/features/pekerjaan/components/DraftPekerjaanList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/draft-pekerjaan')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <DraftPekerjaanList />
        </ProtectedRoute>
    ),
})
