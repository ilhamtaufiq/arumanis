import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { requireAuthenticatedSession } from '@/lib/route-auth'

const MobileSearchPage = lazy(() =>
    import('@/features/mobile/components/MobileSearchPage').then((m) => ({ default: m.MobileSearchPage })),
)

/** Beranda mobile (Capacitor). Tanpa sidebar; izin dan sesi sama dengan area terautentikasi. */
export const Route = createFileRoute('/m')({
    beforeLoad: async () => {
        await requireAuthenticatedSession()
    },
    component: () => (
        <RouteSuspense label="Memuat beranda mobile...">
            <MobileSearchPage />
        </RouteSuspense>
    ),
})
