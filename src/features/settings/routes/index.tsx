import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import SettingsPage from '../components/SettingsPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const settingsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'settings',
})

export const settingsIndexRoute = createRoute({
    getParentRoute: () => settingsRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/settings" requiredMethod="GET">
            <SettingsPage />
        </ProtectedRoute>
    ),
})
