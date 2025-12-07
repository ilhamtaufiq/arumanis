import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import KontrakList from '../components/KontrakList'
import KontrakForm from '../components/KontrakForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const kontrakRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'kontrak',
})

export const kontrakListRoute = createRoute({
    getParentRoute: () => kontrakRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/kontrak" requiredMethod="GET">
            <KontrakList />
        </ProtectedRoute>
    ),
})

export const kontrakCreateRoute = createRoute({
    getParentRoute: () => kontrakRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/kontrak/new" requiredMethod="GET">
            <KontrakForm />
        </ProtectedRoute>
    ),
})

export const kontrakEditRoute = createRoute({
    getParentRoute: () => kontrakRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/kontrak/:id/edit" requiredMethod="GET">
            <KontrakForm />
        </ProtectedRoute>
    ),
})
