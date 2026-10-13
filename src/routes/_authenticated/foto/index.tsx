import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FotoGalleryPage } from '@/features/foto/components/FotoGalleryPage'

export const Route = createFileRoute('/_authenticated/foto/')({
  component: FotoRoute,
})

function FotoRoute() {
  return (
    <ProtectedRoute requiredPath='/foto' requiredMethod='GET'>
      <FotoGalleryPage />
    </ProtectedRoute>
  )
}
