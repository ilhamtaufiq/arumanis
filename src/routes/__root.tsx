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
            void handleStaleAppError(error)
            return <AppUpdateOverlay forceVisible />
        }
        return <ServerErrorPage showReload />
    },
})

function RootComponent() {
    const location = useLocation()
    const isLandingRoute = location.pathname === '/' || location.pathname === ''
    const isPuspenRoute = location.pathname.startsWith('/puspen')
    const isMaintenanceRoute =
        location.pathname === '/maintenance' || location.pathname.startsWith('/maintenance/')
    const isPending = useRouterState({ select: (s) => s.isLoading })

    // Disable app-settings fetch on landing page for instant loading
    useAppSettingsEffect({ enabled: !isLandingRoute && !isPuspenRoute && !isMaintenanceRoute })

    // Only hold shell if not landing page and not exempt
    const holdForMaintenanceCheck =
        isPending && !isLandingRoute && !isMaintenanceExemptPath(location.pathname) && !isMaintenanceRoute

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
