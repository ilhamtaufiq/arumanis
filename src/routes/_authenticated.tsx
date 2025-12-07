import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './root'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_authenticated',
    component: AuthenticatedLayout,
})
