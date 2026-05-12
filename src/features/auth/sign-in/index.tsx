import { useSearch } from '@tanstack/react-router'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
    const search = useSearch({ from: '/sign-in' })
    const rawRedirect = search.redirect
    // Filter out sign-in redirects to prevent loops - redirect to dashboard instead
    const redirect = rawRedirect?.startsWith('/sign-in') ? undefined : rawRedirect

    return (
        <AuthLayout>
            <Card className='gap-4'>
                <CardHeader>
                    <CardTitle className='text-lg tracking-tight'>Masuk</CardTitle>
                    <CardDescription className="space-y-2">
                        <p>
                            ARUMANIS adalah Aplikasi Satu Data Air Minum dan Sanitasi untuk memfasilitasi manajemen proyek infrastruktur, pemantauan kegiatan, dan dokumentasi lapangan.
                        </p>
                        <p>Masukkan Email dan Password Anda</p>
                        <a href='/docs/index.html' className='text-primary hover:underline text-xs mt-1 inline-block'>
                            Butuh bantuan? Pelajari Panduan Penggunaan
                        </a>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserAuthForm redirectTo={redirect} />
                </CardContent>
                <CardFooter>
                    <p className='text-muted-foreground px-8 text-center text-sm'>
                        Dengan masuk, Anda menyetujui{' '}
                        <a
                            href='https://arumanis.cianjur.space/terms'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            Terms of Service
                        </a>{' '}
                        dan{' '}
                        <a
                            href='https://arumanis.cianjur.space/privacy-policy'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </CardFooter>
            </Card>
        </AuthLayout>
    )
}