import { createFileRoute } from '@tanstack/react-router'
import KegiatanList from '@/features/kegiatan/components/KegiatanList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kegiatan/')({
  component: () => (
    <ProtectedRoute requiredPath="/kegiatan" requiredMethod="GET">
      <KegiatanList />
    </ProtectedRoute>
  ),
})
