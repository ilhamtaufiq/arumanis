import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { GoogleSearchPage } from '@/features/search/components/GoogleSearchPage'

const ACCESS_TOKEN = 'thisisjustarandomstring'

export const Route = createFileRoute('/search')({
    beforeLoad: () => {
        const cookieState = getCookie(ACCESS_TOKEN)
        const accessToken = cookieState ? JSON.parse(cookieState) : ''

        if (!accessToken) {
            throw redirect({
                to: '/sign-in',
            })
        }
    },
    component: GoogleSearchPage,
})
