import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import KontrakAddendumGapDetail from '@/features/kontrak/components/KontrakAddendumGapDetail'

export const Route = createFileRoute('/_authenticated/kontrak-addendums/gap/$registerId/')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak" requiredMethod="GET">
      <KontrakAddendumGapDetail />
    </ProtectedRoute>
  ),
})