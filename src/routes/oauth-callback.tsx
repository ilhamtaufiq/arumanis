import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { syncAuthToken } from '@/features/auth/api'
import { redirectToPengawasWithHandoff } from '@/lib/auth-handoff'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'

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

                if (shouldRedirectToPengawasApp(userData.roles)) {
                    await redirectToPengawasWithHandoff()
                    return
                }

                navigate({ to: '/dashboard', replace: true })
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
            <div className='flex flex-col items-center gap-4'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='text-muted-foreground'>Completing authentication...</p>
            </div>
        </div>
    )
}