import { useAppSettingsValues } from '@/hooks/use-app-settings'

type AuthLayoutProps = {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const { logoUrl, appName } = useAppSettingsValues()
    const finalLogo = logoUrl || '/arumanis.svg'

    return (
        <div className='container relative flex min-h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                <div className='flex flex-col space-y-2 text-center'>
                    <img
                        src={finalLogo}
                        alt={appName || 'App Logo'}
                        className='mx-auto h-24 w-auto mb-2'
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                    />
                </div>
                {children}
            </div>
        </div>
    )
}