import { Outlet, createRootRoute, useLocation, ErrorComponent } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/context/theme-provider'
import { RoutePermissionProvider } from '@/context/route-permission-context'
import { useAppSettingsEffect } from '@/hooks/use-app-settings'

export const Route = createRootRoute({
    component: RootComponent,
    errorComponent: ({ error }) => {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (
            errorMessage.includes('Failed to fetch dynamically imported module') ||
            errorMessage.includes('Importing a module script failed') ||
            errorMessage.includes('ChunkLoadError')
        ) {
            window.location.reload()
            return <div className="flex h-screen w-full items-center justify-center text-sm text-muted-foreground">Memperbarui aplikasi...</div>
        }
        return (
            <div className="p-4">
                <ErrorComponent error={error as any} />
            </div>
        )
    }
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
