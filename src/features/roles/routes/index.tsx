import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import RoleList from '../components/RoleList'
import RoleForm from '../components/RoleForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const roleRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'roles',
})

export const roleListRoute = createRoute({
    getParentRoute: () => roleRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/roles" requiredMethod="GET">
            <RoleList />
        </ProtectedRoute>
    ),
})

export const roleCreateRoute = createRoute({
    getParentRoute: () => roleRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/roles/new" requiredMethod="GET">
            <RoleForm />
        </ProtectedRoute>
    ),
})

export const roleEditRoute = createRoute({
    getParentRoute: () => roleRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/roles/:id/edit" requiredMethod="GET">
            <RoleForm />
        </ProtectedRoute>
    ),
})
