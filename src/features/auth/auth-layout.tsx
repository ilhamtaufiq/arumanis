import { useAppSettingsValues } from '@/hooks/use-app-settings'

type AuthLayoutProps = {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const { logoUrl, appName, loginCoverUrl } = useAppSettingsValues()
    const finalLogo = logoUrl || '/arumanis.svg'

    return (
        <div className='h-svh overflow-hidden bg-[#FFF7E8] text-[#292827] lg:grid lg:grid-cols-2'>
            {/* Kiri: form login — muat penuh, tanpa scroll */}
            <div className='h-svh overflow-hidden flex flex-col items-center justify-center p-6 sm:p-10'>
                <div className='w-full max-w-[420px]'>
                    <div className='flex flex-col space-y-2 text-center mb-5'>
                        <img
                            src={finalLogo}
                            alt={appName || 'App Logo'}
                            className='mx-auto h-14 w-auto drop-shadow-[3px_3px_0_rgba(17,17,17,0.2)]'
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                        />
                    </div>
                    <div className='bg-transparent border-[3px] border-[#292827] shadow-[8px_8px_0_0_#292827] p-5 sm:p-6 relative'>
                        {/* 8-bit accent on top edge */}
                        <div className="absolute inset-x-0 top-0 h-2 bg-[#292827] z-10"></div>
                        <div className="pt-1">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanan: image cover full; jika belum di-upload, tampilkan logo */}
            <div className='hidden lg:flex relative h-svh items-center justify-center bg-transparent p-6 sm:p-10'>
                {loginCoverUrl ? (
                    <div className='relative h-full w-full overflow-hidden border-[3px] border-[#292827] shadow-[4px_4px_0_0_#292827]'>
                        <img
                            src={loginCoverUrl}
                            alt='Cover Arumanis'
                            className='absolute inset-0 h-full w-full object-cover'
                            loading='eager'
                            decoding='async'
                        />
                    </div>
                ) : (
                    <img
                        src={finalLogo}
                        alt={appName || 'App Logo'}
                        className='h-48 w-auto drop-shadow-[6px_6px_0_rgba(23,23,23,0.35)]'
                        loading='eager'
                        decoding='async'
                    />
                )}
            </div>
        </div>
    )
}
