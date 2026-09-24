import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { PengawasAppRedirect } from '@/components/common/PengawasAppRedirect'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import { useAuthStore } from '@/stores/auth-stores'

const DashboardProgramView = lazy(() =>
    lazyImport(
        () => import('@/features/dashboard/components/DashboardProgramView').then((m) => ({ default: m.DashboardProgramView })),
        'dashboard-program',
    ),
)

export const Route = createFileRoute('/_authenticated/program/')({
    component: ProgramRoute,
})

function ProgramRoute() {
    const roles = useAuthStore((state) => state.auth.user?.roles)
    const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)

    if (!isImpersonating && shouldRedirectToPengawasApp(roles)) {
        return <PengawasAppRedirect />
    }

    return (
        <RouteSuspense label='Memuat halaman Program...'>
            <DashboardProgramView />
        </RouteSuspense>
    )
}
