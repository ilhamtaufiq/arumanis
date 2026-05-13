import { createFileRoute } from '@tanstack/react-router'
import ProgressRekap from '@/features/progress/components/ProgressRekap'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/progress_rekap')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
      <ProgressRekap />
    </ProtectedRoute>
  ),
})
