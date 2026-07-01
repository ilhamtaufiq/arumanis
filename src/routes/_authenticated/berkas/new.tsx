import { createFileRoute } from '@tanstack/react-router'
import BerkasForm from '@/features/berkas/components/BerkasForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { z } from 'zod'

const berkasNewSearchSchema = z.object({
  pekerjaan_id: z.coerce.string().optional(),
})

export const Route = createFileRoute('/_authenticated/berkas/new')({
  validateSearch: berkasNewSearchSchema,
  component: () => (
    <ProtectedRoute requiredPath="/berkas" requiredMethod="POST">
      <BerkasForm />
    </ProtectedRoute>
  ),
})
