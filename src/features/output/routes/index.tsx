import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import OutputList from '../components/OutputList'
import OutputForm from '../components/OutputForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const outputRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'output',
})

export const outputListRoute = createRoute({
    getParentRoute: () => outputRoute,
    path: '/',
    component: () => (
        <ProtectedRoute requiredPath="/output" requiredMethod="GET">
            <OutputList />
        </ProtectedRoute>
    ),
})

export const outputCreateRoute = createRoute({
    getParentRoute: () => outputRoute,
    path: 'new',
    component: () => (
        <ProtectedRoute requiredPath="/output/new" requiredMethod="GET">
            <OutputForm />
        </ProtectedRoute>
    ),
})

export const outputEditRoute = createRoute({
    getParentRoute: () => outputRoute,
    path: '$id/edit',
    component: () => (
        <ProtectedRoute requiredPath="/output/:id/edit" requiredMethod="GET">
            <OutputForm />
        </ProtectedRoute>
    ),
})
