import { Link } from '@tanstack/react-router'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { LocaleToggle } from './components/locale-toggle'
import { usePublicLocale } from './i18n/use-public-locale'

export const LEGAL_UPDATED_AT = '25 Juni 2026'
export const INNOVATION_DOC_UPDATED_AT = '29 Juni 2026'
export const INNOVATION_DOC_VERSION_LATAR_BELAKANG = '1.2'
export const INNOVATION_DOC_VERSION_TUJUAN = '1.1'

export type LegalPageActive =
    | 'terms'
    | 'privacy'
    | 'tujuan-manfaat-hasil'
    | 'rancang-bangun-inovasi'
    | 'changelog'

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
        ? 'rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground'
        : 'rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary'
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
        <div className='min-h-svh bg-background text-foreground'>
            <header className='sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl'>
                <div className='mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6'>
                    <Link
                        to={backTo}
                        className='inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary/50 hover:text-primary'
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
                            <p className='truncate text-xs font-semibold uppercase tracking-[0.14em]'>
                                {appName || 'Arumanis'}
                            </p>
                            <p className='truncate text-[10px] font-medium text-muted-foreground'>
                                {legalCopy.subtitle}
                            </p>
                        </div>
                    </div>
                    </div>
                </div>
            </header>

            <main className='mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10'>
                <article className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
                    <div className='border-b border-border px-5 py-4 sm:px-8 sm:py-5'>
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                            <div className='flex items-start gap-3'>
                                <div className='rounded-xl bg-primary/10 p-2.5 text-primary'>
                                    <Icon className='h-6 w-6' aria-hidden />
                                </div>
                                <div>
                                    <p className='mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary'>
                                        {badge}
                                    </p>
                                    <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
                                        {title}
                                    </h1>
                                    <p className='mt-1 text-sm text-muted-foreground'>
                                        {subtitle}
                                    </p>
                                </div>
                            </div>
                            <p className='shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                                Diperbarui: {updatedAt}
                            </p>
                        </div>
                    </div>

                    <div className='space-y-8 px-5 py-6 sm:px-8 sm:py-8'>
                        {locale === 'en' && legalCopy.enNotice ? (
                            <div className='rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground'>
                                {legalCopy.enNotice}
                            </div>
                        ) : null}
                        {children}
                    </div>

                    <footer className='flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-4 sm:px-8'>
                        <p className='text-xs text-muted-foreground'>{resolvedFooterNote}</p>
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
                            <Link to='/changelog' className={navLinkClass(active === 'changelog')}>
                                {legalCopy.changelog}
                            </Link>
                            <a
                                href='/docs/'
                                className='rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary'
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
            <h2 className='mb-3 border-b border-border pb-2 text-lg font-bold tracking-tight text-foreground sm:text-xl'>
                {title}
            </h2>
            <div className='space-y-3 text-sm leading-relaxed text-foreground/80'>
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
                    className='rounded-r-lg border-l-[3px] border-primary bg-muted/50 py-2 pl-4 pr-3 text-sm leading-relaxed text-foreground/85'
                >
                    {item}
                </li>
            ))}
        </ul>
    )
}

export function LegalSubheading({ children }: { children: React.ReactNode }) {
    return (
        <h3 className='text-base font-semibold tracking-tight text-foreground sm:text-lg'>
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
        <div className='overflow-x-auto rounded-lg border border-border'>
            <table className='w-full min-w-[640px] border-collapse bg-card text-left'>
                <thead>
                    <tr className='border-b border-border bg-muted/60'>
                        {headers.map((header) => (
                            <th
                                key={header}
                                className={`px-3 py-2 font-semibold uppercase tracking-wide text-foreground last:border-r-0 ${compact ? 'text-[10px]' : 'text-[11px]'}`}
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
                            className='border-b border-border last:border-b-0 even:bg-muted/40'
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className={`px-3 py-2.5 align-top leading-relaxed text-foreground/85 last:border-r-0 ${compact ? 'text-xs' : 'text-sm'}`}
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
        <pre className='overflow-x-auto rounded-lg bg-foreground px-4 py-3 text-xs leading-relaxed text-background'>
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
                    className='rounded-r-lg border-l-[3px] border-primary bg-muted/50 py-2 pl-4 pr-3 text-sm leading-relaxed text-foreground/85'
                >
                    <span className='mr-2 font-bold text-primary'>{index + 1}.</span>
                    {item}
                </li>
            ))}
        </ol>
    )
}

type LegalCalloutProps = {
    variant?: 'tip' | 'important'
    children: React.ReactNode
}

export function LegalCallout({ variant = 'tip', children }: LegalCalloutProps) {
    const styles =
        variant === 'important'
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-muted/50'

    return (
        <div
            className={`rounded-lg border ${styles} px-4 py-3 text-sm leading-relaxed text-foreground/85`}
        >
            {children}
        </div>
    )
}
