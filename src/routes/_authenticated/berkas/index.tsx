import { createFileRoute } from '@tanstack/react-router'
import MediaLibrary from '@/features/berkas/components/MediaLibrary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { z } from 'zod'

const berkasSearchSchema = z.object({
  type: z.enum(['all', 'images', 'docs']).optional(),
})

export const Route = createFileRoute('/_authenticated/berkas/')({
  validateSearch: berkasSearchSchema,
  component: () => (
    <ProtectedRoute requiredPath="/berkas" requiredMethod="GET">
      <MediaLibrary />
    </ProtectedRoute>
  ),
})

