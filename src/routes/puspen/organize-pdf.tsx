import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { PuspenOrganizePdfFilesPage } from '@/features/puspen/components/PuspenOrganizePdfFilesPage'

const ACCESS_TOKEN = 'thisisjustarandomstring'

export const Route = createFileRoute('/puspen/organize-pdf')({
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
    component: PuspenOrganizePdfRoute,
})

function PuspenOrganizePdfRoute() {
    return <PuspenOrganizePdfFilesPage />
}
