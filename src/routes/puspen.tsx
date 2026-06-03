import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { getAppSettings, getSettingValue } from '@/features/settings/api'

const ACCESS_TOKEN = 'thisisjustarandomstring'

export const Route = createFileRoute('/puspen')({
    beforeLoad: async ({ location }) => {
        const cookieState = getCookie(ACCESS_TOKEN)
        const accessToken = cookieState ? JSON.parse(cookieState) : ''

        if (!accessToken) {
            if (location.pathname === '/puspen/progress-fisik') {
                const settings = await getAppSettings()
                if (getSettingValue(settings.data, 'puspen_progress_fisik_public') === '1') {
                    return
                }
            }

            throw redirect({
                to: '/sign-in',
            })
        }

        const userCookie = getCookie('auth_user_data')
        const user = userCookie ? JSON.parse(userCookie) : null

        if (user && user.roles.includes('user') && user.roles.length === 1) {
            throw redirect({
                to: '/unauthorized',
            })
        }
    },
    component: PuspenLayoutRoute,
})

function PuspenLayoutRoute() {
    return <Outlet />
}
