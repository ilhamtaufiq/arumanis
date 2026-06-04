import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/context/theme-provider'
import { RoutePermissionProvider } from '@/context/route-permission-context'
import { useAppSettingsEffect } from '@/hooks/use-app-settings'

export const Route = createRootRoute({
    component: RootComponent,
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
                <Toaster />
            </RoutePermissionProvider>
        </ThemeProvider>
    )
}
