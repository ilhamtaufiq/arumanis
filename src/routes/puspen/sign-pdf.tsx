import { createFileRoute, redirect } from '@tanstack/react-router'
import { PuspenPage } from '@/features/puspen'
import { getCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'

export const Route = createFileRoute('/puspen/sign-pdf')({
    beforeLoad: () => {
        const cookieState = getCookie(ACCESS_TOKEN)
        const accessToken = cookieState ? JSON.parse(cookieState) : ''

        if (!accessToken) {
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
    component: PuspenSignPdfRoute,
})

function PuspenSignPdfRoute() {
    return <PuspenPage />
}
