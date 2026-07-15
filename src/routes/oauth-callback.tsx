import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { syncAuthToken } from '@/features/auth/api'
import { redirectToExternalAppWithHandoff, redirectToPengawasWithHandoff } from '@/lib/auth-handoff'
import { needsDashboardDestinationChoice, shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import {
    consumePostLoginRedirect,
    isExternalRedirectUrl,
    resolvePostLoginPath,
} from '@/lib/post-login-redirect'
import { DashboardDestinationModal } from '@/components/common/DashboardDestinationModal'

function readHashParams() {
    const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash

    return new URLSearchParams(hash)
}

function stripAuthHashFromUrl() {
    const url = new URL(window.location.href)
    url.hash = ''
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}`)
}

export const Route = createFileRoute('/oauth-callback')({
    component: OAuthCallback,
})

function OAuthCallback() {
    const navigate = useNavigate()
    const processed = useRef(false)
    const [destinationChoiceOpen, setDestinationChoiceOpen] = useState(false)
    const [pendingPortalPath, setPendingPortalPath] = useState('/dashboard')
    const [userName, setUserName] = useState<string | null>(null)
    const [isWorking, setIsWorking] = useState(true)

    useEffect(() => {
        if (processed.current) return
        processed.current = true

        async function handleCallback() {
            const { auth } = useAuthStore.getState()
            const hashParams = readHashParams()
            const token = hashParams.get('token') || undefined
            const error = hashParams.get('error') || undefined

            stripAuthHashFromUrl()

            if (error) {
                toast.error(error || 'Authentication failed')
                navigate({ to: '/sign-in', replace: true })
                return
            }

            if (!token) {
                navigate({ to: '/sign-in', replace: true })
                return
            }

            try {
                await syncAuthToken(token)
                auth.setSessionActive(true)

                const meResponse = await fetch('/bff/auth/me', {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                })
                const mePayload = await meResponse.json()
                const userData = mePayload?.user

                if (!userData) {
                    throw new Error('Failed to load user profile')
                }

                auth.hydrateFromSession({
                    user: userData,
                    isImpersonating: Boolean(mePayload?.isImpersonating),
                    impersonator: mePayload?.impersonator ?? null,
                })

                toast.success(`Welcome, ${userData.name || 'User'}!`)

                const redirectTo = consumePostLoginRedirect()

                if (needsDashboardDestinationChoice(userData.roles)) {
                    if (redirectTo && isExternalRedirectUrl(redirectTo)) {
                        await redirectToExternalAppWithHandoff(redirectTo)
                        return
                    }
                    setUserName(userData.name || null)
                    setPendingPortalPath(resolvePostLoginPath(userData.roles, redirectTo))
                    setDestinationChoiceOpen(true)
                    setIsWorking(false)
                    return
                }

                if (shouldRedirectToPengawasApp(userData.roles)) {
                    await redirectToPengawasWithHandoff()
                    return
                }

                if (redirectTo && isExternalRedirectUrl(redirectTo)) {
                    await redirectToExternalAppWithHandoff(redirectTo)
                    return
                }

                const targetPath = resolvePostLoginPath(userData.roles, redirectTo)
                navigate({ to: targetPath, replace: true })
            } catch (callbackError) {
                console.error('OAuth callback error:', callbackError)
                toast.error('Failed to complete authentication')
                auth.reset()
                navigate({ to: '/sign-in', replace: true })
            }
        }

        void handleCallback()
    }, [navigate])

    return (
        <div className='flex h-svh items-center justify-center'>
            <DashboardDestinationModal
                open={destinationChoiceOpen}
                userName={userName}
                onChooseArumanis={() => {
                    setDestinationChoiceOpen(false)
                    navigate({ to: pendingPortalPath, replace: true })
                }}
            />
            {isWorking && (
                <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='text-muted-foreground'>Completing authentication...</p>
                </div>
            )}
        </div>
    )
}