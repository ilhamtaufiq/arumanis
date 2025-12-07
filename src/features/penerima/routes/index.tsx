import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import PenerimaList from '../components/PenerimaList'
import PenerimaForm from '../components/PenerimaForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const penerimaRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'penerima',
})

export const penerimaListRoute = createRoute({
    getParentRoute: () => penerimaRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/penerima" requiredMethod="GET">
            <PenerimaList />
        </ProtectedRoute>
    ),
})

export const penerimaCreateRoute = createRoute({
    getParentRoute: () => penerimaRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/penerima/new" requiredMethod="GET">
            <PenerimaForm />
        </ProtectedRoute>
    ),
})

export const penerimaEditRoute = createRoute({
    getParentRoute: () => penerimaRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/penerima/:id/edit" requiredMethod="GET">
            <PenerimaForm />
        </ProtectedRoute>
    ),
})
