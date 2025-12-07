import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import KecamatanList from '../components/KecamatanList'
import KecamatanForm from '../components/KecamatanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const kecamatanRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'kecamatan',
})

export const kecamatanListRoute = createRoute({
    getParentRoute: () => kecamatanRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/kecamatan" requiredMethod="GET">
            <KecamatanList />
        </ProtectedRoute>
    ),
})

export const kecamatanCreateRoute = createRoute({
    getParentRoute: () => kecamatanRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/kecamatan/new" requiredMethod="GET">
            <KecamatanForm />
        </ProtectedRoute>
    ),
})

export const kecamatanEditRoute = createRoute({
    getParentRoute: () => kecamatanRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/kecamatan/:id/edit" requiredMethod="GET">
            <KecamatanForm />
        </ProtectedRoute>
    ),
})
