import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { getCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: () => {
        const cookieState = getCookie(ACCESS_TOKEN)
        const accessToken = cookieState ? JSON.parse(cookieState) : ''

        if (!accessToken) {
            throw redirect({
                to: '/sign-in',
            })
        }

        // Role check: users with only 'user' role cannot access dashboard
        const userCookie = getCookie('auth_user_data')
        const user = userCookie ? JSON.parse(userCookie) : null

        if (user && user.roles.includes('user') && user.roles.length === 1) {
            throw redirect({
                to: '/unauthorized',
            })
        }
    },
    component: AuthenticatedLayout,
})
