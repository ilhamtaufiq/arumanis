import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import PermissionList from '../components/PermissionList'
import PermissionForm from '../components/PermissionForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const permissionRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'permissions',
})

export const permissionListRoute = createRoute({
    getParentRoute: () => permissionRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/permissions" requiredMethod="GET">
            <PermissionList />
        </ProtectedRoute>
    ),
})

export const permissionCreateRoute = createRoute({
    getParentRoute: () => permissionRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/permissions/new" requiredMethod="GET">
            <PermissionForm />
        </ProtectedRoute>
    ),
})

export const permissionEditRoute = createRoute({
    getParentRoute: () => permissionRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/permissions/:id/edit" requiredMethod="GET">
            <PermissionForm />
        </ProtectedRoute>
    ),
})
