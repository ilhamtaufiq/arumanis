import { Outlet, createRootRoute, redirect, useLocation, useRouterState } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { AppUpdateOverlay } from '@/components/app-update-overlay'
import { NotFoundPage, ServerErrorPage } from '@/components/errors/error-page'
import { ThemeProvider } from '@/context/theme-provider'
import { RoutePermissionProvider } from '@/context/route-permission-context'
import { useAppSettingsEffect } from '@/hooks/use-app-settings'
import { isMaintenanceExemptPath } from '@/features/settings/lib/maintenance'
import { shouldBlockForMaintenance } from '@/lib/maintenance-session'
import { VisitorAnalytics } from '@/components/analytics/VisitorAnalytics'
import { handleStaleAppError, isAssetLoadError } from '@/lib/app-cache'

export const Route = createRootRoute({
    beforeLoad: async ({ location }) => {
        // Block before any child (landing, dashboard, …) mounts — no flash.
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
    const isPuspenRoute = location.pathname.startsWith('/puspen')
    const isMaintenanceRoute =
        location.pathname === '/maintenance' || location.pathname.startsWith('/maintenance/')
    const isPending = useRouterState({ select: (s) => s.isLoading || s.isTransitioning })

    useAppSettingsEffect({ enabled: !isPuspenRoute && !isMaintenanceRoute })

    // While beforeLoad resolves, hold a blank shell so landing never paints first.
    const holdForMaintenanceCheck =
        isPending && !isMaintenanceExemptPath(location.pathname) && !isMaintenanceRoute

    return (
        <ThemeProvider>
            <RoutePermissionProvider>
                <VisitorAnalytics />
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
