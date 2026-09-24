import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { PengawasAppRedirect } from '@/components/common/PengawasAppRedirect'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import { useAuthStore } from '@/stores/auth-stores'

const DashboardKeuanganView = lazy(() =>
    lazyImport(
        () => import('@/features/dashboard/components/DashboardKeuanganView').then((m) => ({ default: m.DashboardKeuanganView })),
        'dashboard-keuangan',
    ),
)

export const Route = createFileRoute('/_authenticated/keuangan/')({
    component: KeuanganRoute,
})

function KeuanganRoute() {
    const roles = useAuthStore((state) => state.auth.user?.roles)
    const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)

    if (!isImpersonating && shouldRedirectToPengawasApp(roles)) {
        return <PengawasAppRedirect />
    }

    return (
        <RouteSuspense label='Memuat halaman Fisik dan Keuangan...'>
            <DashboardKeuanganView />
        </RouteSuspense>
    )
}
