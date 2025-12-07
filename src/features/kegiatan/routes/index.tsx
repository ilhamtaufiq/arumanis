import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import KegiatanList from '../components/KegiatanList'
import KegiatanForm from '../components/KegiatanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const kegiatanRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'kegiatan',
})

export const kegiatanListRoute = createRoute({
    getParentRoute: () => kegiatanRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/kegiatan" requiredMethod="GET">
            <KegiatanList />
        </ProtectedRoute>
    ),
})

export const kegiatanCreateRoute = createRoute({
    getParentRoute: () => kegiatanRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/kegiatan/new" requiredMethod="GET">
            <KegiatanForm />
        </ProtectedRoute>
    ),
})

export const kegiatanEditRoute = createRoute({
    getParentRoute: () => kegiatanRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/kegiatan/:id/edit" requiredMethod="GET">
            <KegiatanForm />
        </ProtectedRoute>
    ),
})
