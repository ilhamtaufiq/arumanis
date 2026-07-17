import { useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'
import { usePageSeo } from '@/hooks/use-page-seo'

export function SignIn() {
    usePageSeo({ robots: 'noindex, nofollow' })

    const search = useSearch({ from: '/sign-in' })
    const rawRedirect = search.redirect
    const redirect = rawRedirect?.startsWith('/sign-in') ? undefined : rawRedirect

    return (
        <AuthLayout>
            <div className='flex flex-col space-y-2 text-center mb-6'>
                <h1 className='text-3xl font-black uppercase tracking-wide text-[#111111]'>
                    Masuk
                </h1>
                <p className='text-sm font-bold text-[#111111]/70'>
                    Masukkan email dan password Anda
                </p>
            </div>
            <div className='grid gap-6'>
                <UserAuthForm redirectTo={redirect} />
                <p className='text-center text-xs font-bold text-[#111111]/70 mt-2'>
                    Dengan melanjutkan, Anda menyetujui{' '}
                    <a
                        href='/terms'
                        className='underline underline-offset-4 hover:text-[#FB8500] hover:decoration-[2px] transition-all'
                    >
                        Syarat & Ketentuan
                    </a>{' '}
                    dan{' '}
                    <a
                        href='/privacy-policy'
                        className='underline underline-offset-4 hover:text-[#FB8500] hover:decoration-[2px] transition-all'
                    >
                        Kebijakan Privasi
                    </a>
                    .
                </p>
            </div>
            <div className='mt-8 pt-6 border-t-[3px] border-[#111111] relative'>
                <p className='text-center text-xs font-bold leading-relaxed text-[#111111]'>
                    <span className='uppercase tracking-[0.18em] text-[#111111] font-black'>Arumanis</span>
                    <br />
                    Air Minum & Sanitasi Cianjur
                </p>
                <div className='flex justify-center mt-5'>
                    <a href='/docs/' className='inline-block border-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-[4px_4px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-[#111111]'>
                        Panduan Penggunaan
                    </a>
                </div>
            </div>
        </AuthLayout>
    )
}
