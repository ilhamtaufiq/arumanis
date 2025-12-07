import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import UserList from '../components/UserList'
import UserForm from '../components/UserForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const userRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'users',
})

export const userListRoute = createRoute({
    getParentRoute: () => userRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/users" requiredMethod="GET">
            <UserList />
        </ProtectedRoute>
    ),
})

export const userCreateRoute = createRoute({
    getParentRoute: () => userRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/users/new" requiredMethod="GET">
            <UserForm />
        </ProtectedRoute>
    ),
})

export const userEditRoute = createRoute({
    getParentRoute: () => userRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/users/:id/edit" requiredMethod="GET">
            <UserForm />
        </ProtectedRoute>
    ),
})
