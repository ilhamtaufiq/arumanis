import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { AppUpdateOverlay } from '@/components/app-update-overlay'
import { NotFoundPage, ServerErrorPage } from '@/components/errors/error-page'
import { ThemeProvider } from '@/context/theme-provider'
import { RoutePermissionProvider } from '@/context/route-permission-context'
import { useAppSettingsEffect } from '@/hooks/use-app-settings'
import { hardReloadApp, isChunkLoadError } from '@/lib/app-cache'

export const Route = createRootRoute({
    component: RootComponent,
    notFoundComponent: NotFoundPage,
    errorComponent: ({ error }) => {
        if (isChunkLoadError(error)) {
            void hardReloadApp()
            return <AppUpdateOverlay />
        }
        return <ServerErrorPage />
    },
})

function RootComponent() {
    const location = useLocation()
    const isPuspenRoute = location.pathname.startsWith('/puspen')

    // Apply app settings (title, favicon, meta tags) dynamically
    useAppSettingsEffect({ enabled: !isPuspenRoute });

    return (
        <ThemeProvider>
            <RoutePermissionProvider>
                <Outlet />
                <AppUpdateOverlay />
                <Toaster />
            </RoutePermissionProvider>
        </ThemeProvider>
    )
}
