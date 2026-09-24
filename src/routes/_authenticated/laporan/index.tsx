import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { PengawasAppRedirect } from '@/components/common/PengawasAppRedirect'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import { useAuthStore } from '@/stores/auth-stores'

const LaporanPage = lazy(() =>
    lazyImport(
        () => import('@/features/laporan/components/LaporanPage').then((m) => ({ default: m.LaporanPage })),
        'laporan-page',
    ),
)

export const Route = createFileRoute('/_authenticated/laporan/')({
    component: LaporanRoute,
})

function LaporanRoute() {
    const roles = useAuthStore((state) => state.auth.user?.roles)
    const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)

    if (!isImpersonating && shouldRedirectToPengawasApp(roles)) {
        return <PengawasAppRedirect />
    }

    return (
        <RouteSuspense label='Memuat halaman Laporan...'>
            <LaporanPage />
        </RouteSuspense>
    )
}
