import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import Dashboard from '../components/Dashboard'

export const dashboardRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/',
    component: Dashboard,
})
