import { useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
    const search = useSearch({ from: '/sign-in' })
    const rawRedirect = search.redirect
    // Filter out sign-in redirects to prevent loops - redirect to dashboard instead
    const redirect = rawRedirect?.startsWith('/sign-in') ? undefined : rawRedirect

    return (
        <AuthLayout>
            <div className='flex flex-col space-y-2 text-center mb-4'>
                <h1 className='text-2xl font-semibold tracking-tight'>
                    Masuk ke Akun
                </h1>
                <p className='text-sm text-muted-foreground'>
                    Masukkan email dan password Anda di bawah ini
                </p>
            </div>
            <div className='grid gap-6'>
                <UserAuthForm redirectTo={redirect} />
                <p className='px-8 text-center text-sm text-muted-foreground'>
                    By clicking continue, you agree to our{' '}
                    <a
                        href='/terms'
                        className='hover:text-primary underline underline-offset-4'
                    >
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                        href='/privacy'
                        className='hover:text-primary underline underline-offset-4'
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
            <div className='mt-8 pt-6 border-t border-border'>
                <p className='text-center text-xs text-muted-foreground leading-relaxed'>
                    <span className='font-bold uppercase tracking-wider text-foreground/70'>Arumanis</span>
                    <br />
                    Air Minum dan Sanitasi Kabupaten Cianjur
                </p>
                <div className='flex justify-center mt-4'>
                    <a href='/docs/index.html' className='text-primary hover:underline text-xs'>
                        Panduan Penggunaan
                    </a>
                </div>
            </div>
        </AuthLayout>
    )
}
