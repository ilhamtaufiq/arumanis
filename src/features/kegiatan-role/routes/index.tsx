import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import KegiatanRoleList from '../components/KegiatanRoleList'
import KegiatanRoleForm from '../components/KegiatanRoleForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const kegiatanRoleRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'kegiatan-role',
})

export const kegiatanRoleListRoute = createRoute({
    getParentRoute: () => kegiatanRoleRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/kegiatan-role" requiredMethod="GET">
            <KegiatanRoleList />
        </ProtectedRoute>
    ),
})

export const kegiatanRoleCreateRoute = createRoute({
    getParentRoute: () => kegiatanRoleRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/kegiatan-role/new" requiredMethod="GET">
            <KegiatanRoleForm />
        </ProtectedRoute>
    ),
})
