import { useEffect, useRef, useState } from 'react'
import { Outlet, createRootRoute, redirect, useLocation, useRouterState } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { AppUpdateOverlay } from '@/components/app-update-overlay'
import { NotFoundPage, ServerErrorPage } from '@/components/errors/error-page'
import { ThemeProvider } from '@/context/theme-provider'
import { RoutePermissionProvider } from '@/context/route-permission-context'
import { useAppSettingsEffect } from '@/hooks/use-app-settings'
import { isMaintenanceExemptPath } from '@/features/settings/lib/maintenance'
import { shouldBlockForMaintenance } from '@/lib/maintenance-session'
import { handleStaleAppError, isAssetLoadError } from '@/lib/app-cache'

export const Route = createRootRoute({
    beforeLoad: async ({ location }) => {
        // Do not block landing page ('/') or exempt paths
        if (isMaintenanceExemptPath(location.pathname)) {
            return
        }
        if (await shouldBlockForMaintenance(location.pathname)) {
            if (location.pathname !== '/maintenance' && !location.pathname.startsWith('/maintenance/')) {
                throw redirect({ to: '/maintenance' })
            }
        }
    },
    component: RootComponent,
    notFoundComponent: NotFoundPage,
    errorComponent: ({ error }) => {
        if (isAssetLoadError(error)) {
            return <AssetErrorFallback error={error} />
        }
        return <ServerErrorPage showReload />
    },
})

/**
 * Overlay selama reload otomatis. Bila reload tidak bisa dimulai (batas percobaan habis),
 * tampilkan halaman error dengan tombol muat ulang agar pengguna tidak terkunci di overlay.
 */
function AssetErrorFallback({ error }: { error: unknown }) {
    const startRef = useRef<Promise<boolean> | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        // Ref menjaga reload hanya dipicu sekali, termasuk saat StrictMode memanggil effect dua kali.
        startRef.current ??= handleStaleAppError(error)
        let active = true
        void startRef.current.then((started) => {
            if (active && !started) setFailed(true)
        })
        return () => {
            active = false
        }
    }, [error])

    if (failed) return <ServerErrorPage showReload />
    return <AppUpdateOverlay forceVisible />
}

function RootComponent() {
    const location = useLocation()
    const isLandingRoute = location.pathname === '/' || location.pathname === ''
    const isMaintenanceRoute =
        location.pathname === '/maintenance' || location.pathname.startsWith('/maintenance/')
    // Hanya tahan shell pada load pertama (belum ada lokasi yang ter-resolve).
    // Sebelumnya dipakai `isLoading` untuk setiap navigasi, sehingga seluruh
    // layout (sidebar, header, provider) di-unmount lalu di-mount ulang setiap
    // pindah halaman — sumber utama lag & kedip saat navigasi.
    const isInitialLoad = useRouterState({ select: (s) => s.isLoading && !s.resolvedLocation })

    // Disable app-settings fetch on landing page for instant loading
    useAppSettingsEffect({ enabled: !isLandingRoute && !isMaintenanceRoute })

    // Only hold shell if not landing page and not exempt
    const holdForMaintenanceCheck =
        isInitialLoad && !isLandingRoute && !isMaintenanceExemptPath(location.pathname) && !isMaintenanceRoute

    return (
        <ThemeProvider>
            <RoutePermissionProvider>
                {holdForMaintenanceCheck ? (
                    <div className="min-h-svh bg-[#fff7e8]" aria-busy="true" aria-label="Memeriksa status layanan" />
                ) : (
                    <Outlet />
                )}
                <AppUpdateOverlay />
                <Toaster />
            </RoutePermissionProvider>
        </ThemeProvider>
    )
}
