import { Link } from '@tanstack/react-router'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

export const LEGAL_UPDATED_AT = '25 Juni 2026'

type LegalPageLayoutProps = {
    title: string
    subtitle: string
    icon: LucideIcon
    badge: string
    children: React.ReactNode
    active: 'terms' | 'privacy'
}

export function LegalPageLayout({
    title,
    subtitle,
    icon: Icon,
    badge,
    children,
    active,
}: LegalPageLayoutProps) {
    const { logoUrl, appName } = useAppSettingsValues()
    const finalLogo = logoUrl || '/arumanis.svg'

    return (
        <div className='min-h-svh bg-[#FFF7E8] text-[#111111]'>
            <header className='sticky top-0 z-30 border-b-[3px] border-[#111111] bg-[#FFFDF8] shadow-[0_4px_0_0_#111111]'>
                <div className='mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6'>
                    <Link
                        to='/sign-in'
                        className='inline-flex items-center gap-2 border-[2px] border-[#111111] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0_0_#111111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111111]'
                    >
                        <ArrowLeft className='h-3.5 w-3.5' aria-hidden />
                        Kembali
                    </Link>
                    <div className='flex min-w-0 items-center gap-2.5'>
                        <img
                            src={finalLogo}
                            alt={appName || 'Arumanis'}
                            className='h-9 w-9 shrink-0'
                            loading='eager'
                            decoding='async'
                        />
                        <div className='min-w-0 text-right sm:text-left'>
                            <p className='truncate text-xs font-black uppercase tracking-[0.14em]'>
                                {appName || 'Arumanis'}
                            </p>
                            <p className='truncate text-[10px] font-bold text-[#111111]/65'>
                                Air Minum & Sanitasi Cianjur
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className='mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10'>
                <article className='overflow-hidden border-[3px] border-[#111111] bg-white shadow-[8px_8px_0_0_#111111]'>
                    <div className='border-b-[3px] border-[#111111] bg-[#B7E4C7] px-5 py-4 sm:px-8 sm:py-5'>
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                            <div className='flex items-start gap-3'>
                                <div className='border-[2px] border-[#111111] bg-white p-2.5 shadow-[3px_3px_0_0_#111111]'>
                                    <Icon className='h-6 w-6 text-[#111111]' aria-hidden />
                                </div>
                                <div>
                                    <p className='mb-1 inline-block border-[2px] border-[#111111] bg-[#FFFDF8] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] shadow-[2px_2px_0_0_#111111]'>
                                        {badge}
                                    </p>
                                    <h1 className='text-2xl font-black tracking-tight sm:text-3xl'>
                                        {title}
                                    </h1>
                                    <p className='mt-1 text-sm font-semibold text-[#111111]/70'>
                                        {subtitle}
                                    </p>
                                </div>
                            </div>
                            <p className='shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#111111]/60'>
                                Diperbarui: {LEGAL_UPDATED_AT}
                            </p>
                        </div>
                    </div>

                    <div className='space-y-8 px-5 py-6 sm:px-8 sm:py-8'>{children}</div>

                    <footer className='flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-dashed border-[#111111]/25 bg-[#FFFDF8] px-5 py-4 sm:px-8'>
                        <p className='text-xs font-bold text-[#111111]/65'>
                            Dokumen hukum Arumanis — gunakan bersama panduan pengguna.
                        </p>
                        <nav className='flex flex-wrap gap-2' aria-label='Dokumen terkait'>
                            <Link
                                to='/terms'
                                className={
                                    active === 'terms'
                                        ? 'border-[2px] border-[#111111] bg-[#FB8500] px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111]'
                                        : 'border-[2px] border-[#111111] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111] hover:bg-[#8ECAE6]'
                                }
                            >
                                Syarat & Ketentuan
                            </Link>
                            <Link
                                to='/privacy-policy'
                                className={
                                    active === 'privacy'
                                        ? 'border-[2px] border-[#111111] bg-[#FB8500] px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111]'
                                        : 'border-[2px] border-[#111111] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111] hover:bg-[#8ECAE6]'
                                }
                            >
                                Kebijakan Privasi
                            </Link>
                            <a
                                href='/docs/index.html'
                                className='border-[2px] border-[#111111] bg-[#8ECAE6] px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#111111]'
                            >
                                Panduan
                            </a>
                        </nav>
                    </footer>
                </article>
            </main>
        </div>
    )
}

type LegalSectionProps = {
    id: string
    title: string
    children: React.ReactNode
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
    return (
        <section id={id} className='scroll-mt-28'>
            <h2 className='mb-3 border-b-[2px] border-[#111111] pb-2 text-lg font-black tracking-tight sm:text-xl'>
                {title}
            </h2>
            <div className='space-y-3 text-sm font-semibold leading-relaxed text-[#111111]/80'>
                {children}
            </div>
        </section>
    )
}

export function LegalList({ items }: { items: string[] }) {
    return (
        <ul className='list-none space-y-2 pl-0'>
            {items.map((item) => (
                <li
                    key={item}
                    className='relative border-l-[3px] border-[#8ECAE6] bg-[#F7F3EA] py-2 pl-4 pr-3 text-sm font-semibold leading-relaxed text-[#111111]/85'
                >
                    {item}
                </li>
            ))}
        </ul>
    )
}

type LegalCalloutProps = {
    variant?: 'tip' | 'important'
    children: React.ReactNode
}

export function LegalCallout({ variant = 'tip', children }: LegalCalloutProps) {
    const styles =
        variant === 'important'
            ? 'border-[#FB8500] bg-[#FFF4DF]'
            : 'border-[#8ECAE6] bg-[#F0F9FF]'

    return (
        <div
            className={`border-[2px] ${styles} px-4 py-3 text-sm font-semibold leading-relaxed text-[#111111]/85 shadow-[3px_3px_0_0_#111111]`}
        >
            {children}
        </div>
    )
}