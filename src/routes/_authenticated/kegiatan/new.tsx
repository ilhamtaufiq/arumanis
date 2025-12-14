import { createFileRoute } from '@tanstack/react-router'
import KegiatanForm from '@/features/kegiatan/components/KegiatanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kegiatan/new')({
  component: () => (
    <ProtectedRoute requiredPath="/kegiatan" requiredMethod="POST">
      <KegiatanForm />
    </ProtectedRoute>
  ),
})
