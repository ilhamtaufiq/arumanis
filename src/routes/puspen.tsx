import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { fetchSession, hasActiveSession } from '@/lib/auth-session'
import { isPublicOnlyUser } from '@/lib/post-login-redirect'
import { getAppSettings, getSettingValue } from '@/features/settings/api'
import { usePuspenLightTheme } from '@/features/puspen/hooks/use-puspen-light-theme'
import { usePageSeo } from '@/hooks/use-page-seo'
import { LiveChatWidgetGate } from '@/features/live-chat/components/live-chat-widget-gate'

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
                to: '/',
            })
        }
    },
    component: PuspenLayoutRoute,
})

function PuspenLayoutRoute() {
    usePuspenLightTheme()

    usePageSeo({
        title: 'Puspen Arumanis',
        description:
            'Ruang kerja publikasi, media sharing, PDF, dan progress fisik Puspen Arumanis.',
        image:
            typeof window !== 'undefined'
                ? `${window.location.origin}/arumanis.svg`
                : undefined,
        robots: 'noindex, nofollow',
    })

    return (
        <>
            <Outlet />
            <LiveChatWidgetGate />
        </>
    )
}
