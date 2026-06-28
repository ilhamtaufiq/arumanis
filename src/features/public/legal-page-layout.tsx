import { Link } from '@tanstack/react-router'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { LocaleToggle } from './components/locale-toggle'
import { usePublicLocale } from './i18n/use-public-locale'

export const LEGAL_UPDATED_AT = '25 Juni 2026'
export const INNOVATION_DOC_UPDATED_AT = '26 Juni 2026'

export type LegalPageActive =
    | 'terms'
    | 'privacy'
    | 'tujuan-manfaat-hasil'
    | 'rancang-bangun-inovasi'

type LegalPageLayoutProps = {
    title: string
    subtitle: string
    icon: LucideIcon
    badge: string
    children: React.ReactNode
    active: LegalPageActive
    backTo?: '/' | '/sign-in'
    updatedAt?: string
    footerNote?: string
}

function navLinkClass(isActive: boolean) {
    return isActive
        ? 'border-[2px] border-[#111111] bg-[#FB8500] px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111]'
        : 'border-[2px] border-[#111111] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111] hover:bg-[#8ECAE6]'
}

export function LegalPageLayout({
    title,
    subtitle,
    icon: Icon,
    badge,
    children,
    active,
    backTo = '/sign-in',
    updatedAt = LEGAL_UPDATED_AT,
    footerNote,
}: LegalPageLayoutProps) {
    const { logoUrl, appName } = useAppSettingsValues()
    const { locale, messages } = usePublicLocale()
    const legalCopy = messages.legal
    const finalLogo = logoUrl || '/arumanis.svg'
    const resolvedFooterNote = footerNote ?? legalCopy.footerNote

    return (
        <div className='min-h-svh bg-[#FFF7E8] text-[#111111]'>
            <header className='sticky top-0 z-30 border-b-[3px] border-[#111111] bg-[#FFFDF8] shadow-[0_4px_0_0_#111111]'>
                <div className='mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6'>
                    <Link
                        to={backTo}
                        className='inline-flex items-center gap-2 border-[2px] border-[#111111] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0_0_#111111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111111]'
                    >
                        <ArrowLeft className='h-3.5 w-3.5' aria-hidden />
                        {legalCopy.back}
                    </Link>
                    <div className='flex items-center gap-3'>
                        <LocaleToggle variant='legal' />
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
                                {legalCopy.subtitle}
                            </p>
                        </div>
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
                                    <h1 className='text-2xl font-black tracking-tight text-[#111111] sm:text-3xl'>
                                        {title}
                                    </h1>
                                    <p className='mt-1 text-sm font-semibold text-[#111111]/70'>
                                        {subtitle}
                                    </p>
                                </div>
                            </div>
                            <p className='shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#111111]/60'>
                                Diperbarui: {updatedAt}
                            </p>
                        </div>
                    </div>

                    <div className='space-y-8 px-5 py-6 sm:px-8 sm:py-8'>
                        {locale === 'en' && legalCopy.enNotice ? (
                            <div className='border-[2px] border-[#FB8500] bg-[#FFF4DF] px-4 py-3 text-sm font-semibold leading-relaxed text-[#111111]/85 shadow-[3px_3px_0_0_#111111]'>
                                {legalCopy.enNotice}
                            </div>
                        ) : null}
                        {children}
                    </div>

                    <footer className='flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-dashed border-[#111111]/25 bg-[#FFFDF8] px-5 py-4 sm:px-8'>
                        <p className='text-xs font-bold text-[#111111]/65'>{resolvedFooterNote}</p>
                        <nav className='flex flex-wrap gap-2' aria-label='Dokumen terkait'>
                            <Link to='/terms' className={navLinkClass(active === 'terms')}>
                                {legalCopy.terms}
                            </Link>
                            <Link to='/privacy-policy' className={navLinkClass(active === 'privacy')}>
                                {legalCopy.privacy}
                            </Link>
                            <Link
                                to='/rancang-bangun-inovasi'
                                className={navLinkClass(active === 'rancang-bangun-inovasi')}
                            >
                                {legalCopy.designBuild}
                            </Link>
                            <Link
                                to='/tujuan-manfaat-hasil'
                                className={navLinkClass(active === 'tujuan-manfaat-hasil')}
                            >
                                {legalCopy.objectives}
                            </Link>
                            <a
                                href='/docs/index.html'
                                className='border-[2px] border-[#111111] bg-[#8ECAE6] px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_0_#111111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#111111]'
                            >
                                {legalCopy.guide}
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
            <h2 className='mb-3 border-b-[2px] border-[#111111] pb-2 text-lg font-black tracking-tight text-[#111111] sm:text-xl'>
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

export function LegalSubheading({ children }: { children: React.ReactNode }) {
    return (
        <h3 className='text-base font-black tracking-tight text-[#111111] sm:text-lg'>
            {children}
        </h3>
    )
}

type LegalTableProps = {
    headers: string[]
    rows: React.ReactNode[][]
    compact?: boolean
}

export function LegalTable({ headers, rows, compact = false }: LegalTableProps) {
    return (
        <div className='overflow-x-auto border-[2px] border-[#111111] shadow-[3px_3px_0_0_#111111]'>
            <table className='w-full min-w-[640px] border-collapse bg-white text-left'>
                <thead>
                    <tr className='border-b-[2px] border-[#111111] bg-[#8ECAE6]'>
                        {headers.map((header) => (
                            <th
                                key={header}
                                className={`border-r border-[#111111]/20 px-3 py-2 font-black uppercase tracking-wide text-[#111111] last:border-r-0 ${compact ? 'text-[10px]' : 'text-[11px]'}`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className='border-b border-[#111111]/15 last:border-b-0 even:bg-[#FFFDF8]'
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className={`border-r border-[#111111]/10 px-3 py-2.5 align-top font-semibold leading-relaxed text-[#111111]/85 last:border-r-0 ${compact ? 'text-xs' : 'text-sm'}`}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function LegalFlowBlock({ children }: { children: string }) {
    return (
        <pre className='overflow-x-auto border-[2px] border-[#111111] bg-[#111111] px-4 py-3 text-xs font-semibold leading-relaxed text-[#B7E4C7] shadow-[3px_3px_0_0_#111111]'>
            {children}
        </pre>
    )
}

export function LegalOrderedList({ items }: { items: string[] }) {
    return (
        <ol className='list-none space-y-2 pl-0 counter-reset-none'>
            {items.map((item, index) => (
                <li
                    key={item}
                    className='relative border-l-[3px] border-[#FB8500] bg-[#FFF4DF] py-2 pl-4 pr-3 text-sm font-semibold leading-relaxed text-[#111111]/85'
                >
                    <span className='mr-2 font-black text-[#FB8500]'>{index + 1}.</span>
                    {item}
                </li>
            ))}
        </ol>
    )
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