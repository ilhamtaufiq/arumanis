import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '@/routes/_authenticated'
import MenuPermissionList from '../components/MenuPermissionList'
import MenuPermissionForm from '../components/MenuPermissionForm'

export const menuPermissionRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: 'menu-permissions',
})

export const menuPermissionListRoute = createRoute({
    getParentRoute: () => menuPermissionRoute,
    path: '/',
    component: MenuPermissionList,
})

export const menuPermissionCreateRoute = createRoute({
    getParentRoute: () => menuPermissionRoute,
    path: 'new',
    component: MenuPermissionForm,
})

export const menuPermissionEditRoute = createRoute({
    getParentRoute: () => menuPermissionRoute,
    path: '$id/edit',
    component: MenuPermissionForm,
})
