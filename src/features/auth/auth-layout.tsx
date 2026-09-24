import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { AnimatedSphere } from '@/features/landing-v2/components/animated-sphere'

type AuthLayoutProps = {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const { logoUrl, appName } = useAppSettingsValues()
    const finalLogo = logoUrl || '/arumanis.svg'

    return (
        <div className='min-h-svh bg-background text-foreground lg:grid lg:grid-cols-2'>
            {/* Kiri: form login */}
            <div className='flex flex-col items-center justify-center p-6 sm:p-10'>
                <div className='w-full max-w-[400px]'>
                    <div className='mb-8 flex justify-center'>
                        <img
                            src={finalLogo}
                            alt={appName || 'App Logo'}
                            className='h-14 w-auto'
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                        />
                    </div>
                    <div className='rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8'>
                        {children}
                    </div>
                </div>
            </div>

            {/* Kanan: animasi sphere */}
            <div className='relative hidden min-h-svh items-center justify-center overflow-hidden border-l border-border bg-muted/40 lg:flex'>
                <div
                    aria-hidden
                    className='pointer-events-none absolute h-[560px] w-[560px] opacity-70'
                >
                    <AnimatedSphere />
                </div>
                <div className='relative z-10 px-10 text-center'>
                    <p className='font-display text-4xl font-bold tracking-tight text-foreground'>
                        {appName || 'Arumanis'}
                    </p>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        Air Minum & Sanitasi Kabupaten Cianjur
                    </p>
                </div>
            </div>
        </div>
    )
}
