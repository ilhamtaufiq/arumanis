import { createRouter } from '@tanstack/react-router'
import { Route as rootRoute } from './routes/root'
import { signInRoute } from './routes/sign-in'
import { authenticatedRoute } from './routes/_authenticated'
import { dashboardRoute } from '@/features/dashboard/routes'
import { kegiatanRoute, kegiatanListRoute, kegiatanCreateRoute, kegiatanEditRoute } from '@/features/kegiatan/routes'
import { kecamatanRoute, kecamatanListRoute, kecamatanCreateRoute, kecamatanEditRoute } from '@/features/kecamatan/routes'
import { desaRoute, desaListRoute, desaCreateRoute, desaEditRoute } from '@/features/desa/routes'
import { pekerjaanRoute, pekerjaanListRoute, pekerjaanCreateRoute, pekerjaanDetailRoute, pekerjaanEditRoute, pekerjaanProgressRoute } from '@/features/pekerjaan/routes'
import { kontrakRoute, kontrakListRoute, kontrakCreateRoute, kontrakEditRoute } from '@/features/kontrak/routes'
import { outputRoute, outputListRoute, outputCreateRoute, outputEditRoute } from '@/features/output/routes'
import { penerimaRoute, penerimaListRoute, penerimaCreateRoute, penerimaEditRoute } from '@/features/penerima/routes'
import { fotoRoute, fotoListRoute, fotoCreateRoute, fotoEditRoute } from '@/features/foto/routes'
import { berkasRoute, berkasListRoute, berkasCreateRoute, berkasEditRoute } from '@/features/berkas/routes'
import { userRoute, userListRoute, userCreateRoute, userEditRoute } from '@/features/users/routes'
import { roleRoute, roleListRoute, roleCreateRoute, roleEditRoute } from '@/features/roles/routes'
import { permissionRoute, permissionListRoute, permissionCreateRoute, permissionEditRoute } from '@/features/permissions/routes'
import { routePermissionRoute, routePermissionListRoute, routePermissionCreateRoute, routePermissionEditRoute } from '@/features/route-permissions/routes'
import { menuPermissionRoute, menuPermissionListRoute, menuPermissionCreateRoute, menuPermissionEditRoute } from '@/features/menu-permissions/routes'
import { settingsRoute, settingsIndexRoute } from '@/features/settings/routes'
import { kegiatanRoleRoute, kegiatanRoleListRoute, kegiatanRoleCreateRoute } from '@/features/kegiatan-role/routes'

const routeTree = rootRoute.addChildren([
    signInRoute,
    authenticatedRoute.addChildren([
        dashboardRoute,
        kegiatanRoute.addChildren([
            kegiatanListRoute,
            kegiatanCreateRoute,
            kegiatanEditRoute,
        ]),
        kecamatanRoute.addChildren([
            kecamatanListRoute,
            kecamatanCreateRoute,
            kecamatanEditRoute,
        ]),
        desaRoute.addChildren([
            desaListRoute,
            desaCreateRoute,
            desaEditRoute,
        ]),
        pekerjaanRoute.addChildren([
            pekerjaanListRoute,
            pekerjaanCreateRoute,
            pekerjaanDetailRoute,
            pekerjaanEditRoute,
            pekerjaanProgressRoute,
        ]),
        kontrakRoute.addChildren([
            kontrakListRoute,
            kontrakCreateRoute,
            kontrakEditRoute,
        ]),
        outputRoute.addChildren([
            outputListRoute,
            outputCreateRoute,
            outputEditRoute,
        ]),
        penerimaRoute.addChildren([
            penerimaListRoute,
            penerimaCreateRoute,
            penerimaEditRoute,
        ]),
        fotoRoute.addChildren([
            fotoListRoute,
            fotoCreateRoute,
            fotoEditRoute,
        ]),
        berkasRoute.addChildren([
            berkasListRoute,
            berkasCreateRoute,
            berkasEditRoute,
        ]),
        userRoute.addChildren([
            userListRoute,
            userCreateRoute,
            userEditRoute,
        ]),
        roleRoute.addChildren([
            roleListRoute,
            roleCreateRoute,
            roleEditRoute,
        ]),
        permissionRoute.addChildren([
            permissionListRoute,
            permissionCreateRoute,
            permissionEditRoute,
        ]),
        routePermissionRoute.addChildren([
            routePermissionListRoute,
            routePermissionCreateRoute,
            routePermissionEditRoute,
        ]),
        menuPermissionRoute.addChildren([
            menuPermissionListRoute,
            menuPermissionCreateRoute,
            menuPermissionEditRoute,
        ]),
        settingsRoute.addChildren([
            settingsIndexRoute,
        ]),
        kegiatanRoleRoute.addChildren([
            kegiatanRoleListRoute,
            kegiatanRoleCreateRoute,
        ]),
    ]),
])

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
