import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const InstagramHubPage = lazy(() =>
  lazyImport(() => import('@/features/instagram/components/InstagramHubPage'), 'instagram-hub'),
)

function InstagramRoute() {
  return (
    <RouteSuspense label="Memuat Instagram...">
      <InstagramHubPage />
    </RouteSuspense>
  )
}

export const Route = createFileRoute('/_authenticated/instagram')({
  component: InstagramRoute,
})
