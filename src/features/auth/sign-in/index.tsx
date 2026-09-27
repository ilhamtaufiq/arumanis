import { useEffect, useRef } from 'react'
import { useSearch } from '@tanstack/react-router'
import { BookOpenText } from 'lucide-react'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'
import { Button } from '@/components/ui/button'
import { usePageSeo } from '@/hooks/use-page-seo'
import { redirectToExternalAppWithHandoff, redirectToPengawasWithHandoff } from '@/lib/auth-handoff'
import { isExternalRedirectUrl } from '@/lib/post-login-redirect'
import { useAuthStore } from '@/stores/auth-stores'

export function SignIn() {
    usePageSeo({ robots: 'noindex, nofollow' })

    const search = useSearch({ from: '/sign-in' })
    const rawRedirect = search.redirect
    const redirect = rawRedirect?.startsWith('/sign-in') ? undefined : rawRedirect

    // Sudah login di portal tapi diarahkan dari app eksternal → handoff langsung,
    // tanpa minta login ulang. (Tanpa ini: worker lempar ke sini, user balik
    // manual ke worker, dilempar lagi — loop tanpa callback.)
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)
    const handoffFired = useRef(false)
    useEffect(() => {
        if (!isSessionActive || !redirect || handoffFired.current) {
            return
        }
        if (redirect.startsWith('/pengawasan')) {
            handoffFired.current = true
            void redirectToPengawasWithHandoff(redirect)
        } else if (isExternalRedirectUrl(redirect)) {
            handoffFired.current = true
            void redirectToExternalAppWithHandoff(redirect)
        }
    }, [isSessionActive, redirect])

    return (
        <AuthLayout>
            <div className='mb-6 flex flex-col space-y-2 text-center'>
                <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
                    Masuk ke Arumanis
                </h1>
                <p className='text-sm text-muted-foreground'>
                    Masukkan email dan kata sandi Anda
                </p>
            </div>
            <div className='grid gap-6'>
                <UserAuthForm redirectTo={redirect} />
                <p className='mt-2 text-center text-xs text-muted-foreground'>
                    Dengan melanjutkan, Anda menyetujui{' '}
                    <a
                        href='/terms'
                        className='underline underline-offset-4 hover:text-primary transition-colors'
                    >
                        Syarat & Ketentuan
                    </a>{' '}
                    dan{' '}
                    <a
                        href='/privacy-policy'
                        className='underline underline-offset-4 hover:text-primary transition-colors'
                    >
                        Kebijakan Privasi
                    </a>
                    .
                </p>
            </div>
            <div className='mt-8 border-t border-border pt-6'>
                <p className='text-center text-xs leading-relaxed text-muted-foreground'>
                    <span className='font-semibold uppercase tracking-[0.18em] text-foreground'>Arumanis</span>
                    <br />
                    Air Minum & Sanitasi Cianjur
                </p>
                <div className='mt-4 flex justify-center'>
                    <Button variant='outline' size='sm' asChild>
                        <a href='/docs/'>
                            <BookOpenText />
                            Panduan Penggunaan
                        </a>
                    </Button>
                </div>
            </div>
        </AuthLayout>
    )
}
