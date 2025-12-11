import { createFileRoute } from '@tanstack/react-router'
import KegiatanForm from '@/features/kegiatan/components/KegiatanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kegiatan/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/kegiatan/:id/edit" requiredMethod="GET">
      <KegiatanForm />
    </ProtectedRoute>
  ),
})
