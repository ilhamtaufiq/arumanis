import { createFileRoute } from '@tanstack/react-router'
import PenerimaForm from '@/features/penerima/components/PenerimaForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/penerima/new')({
  component: () => (
    <ProtectedRoute requiredPath="/penerima" requiredMethod="POST">
      <PenerimaForm />
    </ProtectedRoute>
  ),
})
