import { createFileRoute } from '@tanstack/react-router'
import PenerimaList from '@/features/penerima/components/PenerimaList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/penerima/')({
  component: () => (
    <ProtectedRoute requiredPath="/penerima" requiredMethod="GET">
      <PenerimaList />
    </ProtectedRoute>
  ),
})
