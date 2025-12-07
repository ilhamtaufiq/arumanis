import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import FotoList from '../components/FotoList'
import FotoForm from '../components/FotoForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const fotoRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'foto',
})

export const fotoListRoute = createRoute({
    getParentRoute: () => fotoRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/foto" requiredMethod="GET">
            <FotoList />
        </ProtectedRoute>
    ),
})

export const fotoCreateRoute = createRoute({
    getParentRoute: () => fotoRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/foto/new" requiredMethod="GET">
            <FotoForm />
        </ProtectedRoute>
    ),
})

export const fotoEditRoute = createRoute({
    getParentRoute: () => fotoRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/foto/:id/edit" requiredMethod="GET">
            <FotoForm />
        </ProtectedRoute>
    ),
})
