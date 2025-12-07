import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import DesaList from '../components/DesaList'
import DesaForm from '../components/DesaForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const desaRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'desa',
})

export const desaListRoute = createRoute({
    getParentRoute: () => desaRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/desa" requiredMethod="GET">
            <DesaList />
        </ProtectedRoute>
    ),
})

export const desaCreateRoute = createRoute({
    getParentRoute: () => desaRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/desa/new" requiredMethod="GET">
            <DesaForm />
        </ProtectedRoute>
    ),
})

export const desaEditRoute = createRoute({
    getParentRoute: () => desaRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/desa/:id/edit" requiredMethod="GET">
            <DesaForm />
        </ProtectedRoute>
    ),
})
