import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import RoutePermissionList from '../components/RoutePermissionList'
import RoutePermissionForm from '../components/RoutePermissionForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const routePermissionRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'route-permissions',
})

export const routePermissionListRoute = createRoute({
    getParentRoute: () => routePermissionRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/route-permissions" requiredMethod="GET">
            <RoutePermissionList />
        </ProtectedRoute>
    ),
})

export const routePermissionCreateRoute = createRoute({
    getParentRoute: () => routePermissionRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/route-permissions/new" requiredMethod="GET">
            <RoutePermissionForm />
        </ProtectedRoute>
    ),
})

export const routePermissionEditRoute = createRoute({
    getParentRoute: () => routePermissionRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/route-permissions/:id/edit" requiredMethod="GET">
            <RoutePermissionForm />
        </ProtectedRoute>
    ),
})
