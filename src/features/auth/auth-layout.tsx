import { useAppSettingsValues } from '@/hooks/use-app-settings'

type AuthLayoutProps = {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const { logoUrl, appName } = useAppSettingsValues()
    const finalLogo = logoUrl || '/arumanis.svg'

    return (
        <div className='container grid h-svh max-w-none items-center justify-center'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
                <div className='mb-4 flex items-center justify-center'>
                    <img
                        src={finalLogo}
                        alt={appName || 'App Logo'}
                        className='me-2 h-30 w-auto'
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