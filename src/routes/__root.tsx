import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { AppUpdateOverlay } from '@/components/app-update-overlay'
import { MaintenancePage } from '@/components/maintenance/MaintenancePage'
import { NotFoundPage, ServerErrorPage } from '@/components/errors/error-page'
import { ThemeProvider } from '@/context/theme-provider'
import { RoutePermissionProvider } from '@/context/route-permission-context'
import { useAppSettingsEffect } from '@/hooks/use-app-settings'
import { useShouldShowMaintenance } from '@/hooks/use-maintenance-mode'
import { VisitorAnalytics } from '@/components/analytics/VisitorAnalytics'
import { handleStaleAppError, isAssetLoadError } from '@/lib/app-cache'

export const Route = createRootRoute({
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
    const { show: showMaintenance } = useShouldShowMaintenance(location.pathname)

    // Apply app settings (title, favicon, meta tags) dynamically
    useAppSettingsEffect({ enabled: !isPuspenRoute && !showMaintenance });

    return (
        <ThemeProvider>
            <RoutePermissionProvider>
                <VisitorAnalytics />
                {showMaintenance ? <MaintenancePage /> : <Outlet />}
                <AppUpdateOverlay />
                <Toaster />
            </RoutePermissionProvider>
        </ThemeProvider>
    )
}
