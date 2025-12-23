import { useEffect } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { getCurrentUser } from '@/features/auth/api'
import { z } from 'zod'

const oauthCallbackSearchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
})

export const Route = createFileRoute('/oauth-callback')({
    validateSearch: oauthCallbackSearchSchema,
    component: OAuthCallback,
})

function OAuthCallback() {
    const navigate = useNavigate()
    const search = useSearch({ from: '/oauth-callback' })
    const { auth } = useAuthStore()

    useEffect(() => {
        async function handleCallback() {
            // Check for error
            if (search.error) {
                toast.error(search.error || 'Authentication failed')
                navigate({ to: '/sign-in', replace: true })
                return
            }

            // Check for token in URL
            if (search.token) {
                try {
                    // Store the token first so API calls work
                    auth.setAccessToken(search.token)

                    // Fetch user data using the stored token
                    const userData = await getCurrentUser()
                    auth.setUser(userData)

                    toast.success(`Welcome, ${userData.name}!`)
                    navigate({ to: '/', replace: true })
                } catch (error) {
                    console.error('OAuth callback error:', error)
                    toast.error('Failed to complete authentication')
                    auth.reset()
                    navigate({ to: '/sign-in', replace: true })
                }
            } else {
                // No token provided, redirect to sign-in
                navigate({ to: '/sign-in', replace: true })
            }
        }

        handleCallback()
    }, [search, auth, navigate])

    return (
        <div className='flex h-svh items-center justify-center'>
            <div className='flex flex-col items-center gap-4'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='text-muted-foreground'>Completing authentication...</p>
            </div>
        </div>
    )
}
