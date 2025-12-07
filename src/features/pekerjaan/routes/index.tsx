import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import PekerjaanList from '../components/PekerjaanList'
import PekerjaanForm from '../components/PekerjaanForm'
import PekerjaanDetail from '../components/PekerjaanDetail'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const pekerjaanRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'pekerjaan',
})

export const pekerjaanListRoute = createRoute({
    getParentRoute: () => pekerjaanRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <PekerjaanList />
        </ProtectedRoute>
    ),
})

export const pekerjaanCreateRoute = createRoute({
    getParentRoute: () => pekerjaanRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan/new" requiredMethod="GET">
            <PekerjaanForm />
        </ProtectedRoute>
    ),
})

export const pekerjaanDetailRoute = createRoute({
    getParentRoute: () => pekerjaanRoute,
    path: '$id',
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan/:id" requiredMethod="GET">
            <PekerjaanDetail />
        </ProtectedRoute>
    ),
})

export const pekerjaanEditRoute = createRoute({
    getParentRoute: () => pekerjaanRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan/:id/edit" requiredMethod="GET">
            <PekerjaanForm />
        </ProtectedRoute>
    ),
})
