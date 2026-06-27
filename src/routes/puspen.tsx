import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { fetchSession, hasActiveSession } from '@/lib/auth-session'
import { isPublicOnlyUser } from '@/lib/post-login-redirect'
import { getAppSettings, getSettingValue } from '@/features/settings/api'
import { usePuspenLightTheme } from '@/features/puspen/hooks/use-puspen-light-theme'

const PUSPEN_META = {
    title: 'Puspen Arumanis',
    description: 'Ruang kerja publikasi, media sharing, PDF, dan progress fisik Puspen Arumanis.',
    image: 'https://arumanis.cianjur.space/arumanis.svg',
}

function setMeta(selector: string, content: string) {
    const element = document.querySelector(selector)
    if (element) element.setAttribute('content', content)
}

export const Route = createFileRoute('/puspen')({
    beforeLoad: async ({ location }) => {
        const hasSession = await hasActiveSession()
        const normalizedPathname = location.pathname.replace(/\/+$/, '') || '/'
        const isPublicProgressFisikRoute = normalizedPathname === '/puspen/progress-fisik'

        if (!hasSession) {
            if (isPublicProgressFisikRoute) {
                const settings = await getAppSettings()
                if (getSettingValue(settings.data, 'puspen_progress_fisik_public') === '1') {
                    return
                }
            }

            if (location.pathname.startsWith('/puspen/media-sharing/')) {
                return
            }

            throw redirect({
                to: '/sign-in',
            })
        }

        const session = await fetchSession()
        if (session?.user && isPublicOnlyUser(session.user.roles)) {
            throw redirect({
                to: '/publikasi',
            })
        }
    },
    component: PuspenLayoutRoute,
})

function PuspenLayoutRoute() {
    usePuspenLightTheme()

    useEffect(() => {
        document.title = PUSPEN_META.title
        setMeta('meta[name="title"]', PUSPEN_META.title)
        setMeta('meta[name="description"]', PUSPEN_META.description)
        setMeta('meta[property="og:title"]', PUSPEN_META.title)
        setMeta('meta[property="og:description"]', PUSPEN_META.description)
        setMeta('meta[property="og:image"]', PUSPEN_META.image)
        setMeta('meta[property="twitter:title"]', PUSPEN_META.title)
        setMeta('meta[property="twitter:description"]', PUSPEN_META.description)
        setMeta('meta[property="twitter:image"]', PUSPEN_META.image)
    }, [])

    return <Outlet />
}
