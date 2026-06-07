import { useAppSettingsValues } from '@/hooks/use-app-settings'

type AuthLayoutProps = {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const { logoUrl, appName } = useAppSettingsValues()
    const finalLogo = logoUrl || '/arumanis.svg'

    return (
        <div className='min-h-svh bg-[#FFF7E8] text-[#111111] flex flex-col items-center justify-center p-6'>
            <div className='w-full max-w-[420px]'>
                <div className='flex flex-col space-y-2 text-center mb-8'>
                    <img
                        src={finalLogo}
                        alt={appName || 'App Logo'}
                        className='mx-auto h-24 w-auto drop-shadow-[4px_4px_0_rgba(17,17,17,0.2)]'
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                    />
                </div>
                <div className='bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[8px_8px_0_0_#111111] p-6 sm:p-8 relative'>
                    {/* Add a little 8-bit accent on top edge */}
                    <div className="absolute inset-x-0 top-0 h-3 bg-[#111111] z-10"></div>
                    <div className="pt-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
