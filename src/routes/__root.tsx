import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { AppUpdateOverlay } from '@/components/app-update-overlay'
import { NotFoundPage, ServerErrorPage } from '@/components/errors/error-page'
import { ThemeProvider } from '@/context/theme-provider'
import { RoutePermissionProvider } from '@/context/route-permission-context'
import { useAppSettingsEffect } from '@/hooks/use-app-settings'
import { shouldDeferAppSettings } from '@/lib/public-routes'
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
    const deferAppSettings = shouldDeferAppSettings(location.pathname)

    // Defer app-settings on public marketing pages so first paint is not blocked.
    useAppSettingsEffect({ enabled: !deferAppSettings });

    return (
        <ThemeProvider>
            <RoutePermissionProvider>
                <VisitorAnalytics />
                <Outlet />
                <AppUpdateOverlay />
                <Toaster />
            </RoutePermissionProvider>
        </ThemeProvider>
    )
}
