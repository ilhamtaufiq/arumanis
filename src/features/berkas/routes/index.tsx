import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import BerkasList from '../components/BerkasList'
import BerkasForm from '../components/BerkasForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const berkasRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'berkas',
})

export const berkasListRoute = createRoute({
    getParentRoute: () => berkasRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/berkas" requiredMethod="GET">
            <BerkasList />
        </ProtectedRoute>
    ),
})

export const berkasCreateRoute = createRoute({
    getParentRoute: () => berkasRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/berkas/new" requiredMethod="GET">
            <BerkasForm />
        </ProtectedRoute>
    ),
})

export const berkasEditRoute = createRoute({
    getParentRoute: () => berkasRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/berkas/:id/edit" requiredMethod="GET">
            <BerkasForm />
        </ProtectedRoute>
    ),
})
