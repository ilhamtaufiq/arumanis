import { useEffect } from 'react'
import { ExternalLink, GitBranch, History } from 'lucide-react'
import { usePageSeo } from '@/hooks/use-page-seo'
import { trackVisitorEvent } from '@/lib/analytics/visitor-events'
import { usePublicLocale } from './i18n/use-public-locale'
import {
    CHANGELOG_RELEASES,
    LINEAGE_ERAS,
    PLATFORM_UPDATED_AT,
    PLATFORM_VERSION,
    REPO_LINKS,
    type ChangelogEntry,
} from './lib/platform-changelog'
import {
    LegalCallout,
    LegalPageLayout,
    LegalSection,
    LegalSubheading,
} from './legal-page-layout'

function EntryList({ entries }: { entries: ChangelogEntry[] }) {
    if (!entries.length) {
        return <p className="text-sm font-semibold text-[#111111]/60">—</p>
    }

    return (
        <ul className="list-none space-y-2 pl-0">
            {entries.map((entry) => (
                <li
                    key={`${entry.scope ?? ''}-${entry.text}`}
                    className="border-l-[3px] border-[#8ECAE6] bg-[#F7F3EA] py-2 pl-4 pr-3 text-sm font-semibold leading-relaxed text-[#111111]/85"
                >
                    {entry.scope ? (
                        <span className="mr-1 font-black uppercase tracking-wide text-[#5227FF]">
                            {entry.scope}
                        </span>
                    ) : null}
                    {entry.scope ? ' — ' : null}
                    {entry.text}
                    {entry.date ? (
                        <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-[#111111]/45">
                            {entry.date}
                        </span>
                    ) : null}
                </li>
            ))}
        </ul>
    )
}

export function ChangelogPage() {
    const { locale, messages } = usePublicLocale()
    const copy = messages.changelog

    usePageSeo({
        title: copy.seoTitle,
        description: copy.seoDescription,
        url: typeof window !== 'undefined' ? `${window.location.origin}/changelog` : undefined,
        type: 'article',
    })

    useEffect(() => {
        trackVisitorEvent('public_changelog_view')
    }, [])

    return (
        <LegalPageLayout
            title={copy.title}
            subtitle={copy.subtitle}
            icon={History}
            badge={copy.badge}
            active="changelog"
            backTo="/"
            updatedAt={PLATFORM_UPDATED_AT}
            footerNote={copy.footerNote}
        >
            <LegalCallout variant="important">
                {copy.versionNotice.replace('{version}', PLATFORM_VERSION)}
            </LegalCallout>

            <LegalSection id="lineage" title={copy.lineageTitle}>
                <p>{copy.lineageIntro}</p>
                <div className="space-y-4">
                    {LINEAGE_ERAS.map((era, index) => (
                        <div
                            key={era.id}
                            className="border-[2px] border-[#111111] bg-[#FFFDF8] p-4 shadow-[4px_4px_0_0_#111111]"
                        >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 border-[2px] border-[#111111] bg-[#B7E4C7] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                                    <GitBranch className="h-3 w-3" aria-hidden />
                                    {index + 1}
                                </span>
                                <span
                                    className={`border-[2px] border-[#111111] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                        era.status === 'active' ? 'bg-[#FB8500]' : 'bg-white'
                                    }`}
                                >
                                    {era.status === 'active' ? copy.statusActive : copy.statusArchived}
                                </span>
                            </div>
                            <LegalSubheading>{era.name}</LegalSubheading>
                            <p className="mt-2 text-sm font-semibold text-[#111111]/75">{era.summary}</p>
                            <dl className="mt-3 grid gap-2 text-xs font-bold uppercase tracking-wide text-[#111111]/55 sm:grid-cols-2">
                                <div>
                                    <dt>{copy.eraPeriod}</dt>
                                    <dd className="mt-0.5 normal-case tracking-normal text-[#111111]/80">{era.period}</dd>
                                </div>
                                <div>
                                    <dt>{copy.eraArchitecture}</dt>
                                    <dd className="mt-0.5 normal-case tracking-normal text-[#111111]/80">{era.architecture}</dd>
                                </div>
                            </dl>
                            <a
                                href={era.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#5227FF] hover:underline"
                            >
                                {era.repoLabel}
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            </a>
                        </div>
                    ))}
                </div>
            </LegalSection>

            <LegalSection id="releases" title={copy.releasesTitle}>
                <p>{copy.releasesIntro}</p>
                <div className="space-y-6">
                    {CHANGELOG_RELEASES.map((release) => (
                        <div
                            key={release.version}
                            className="overflow-hidden border-[2px] border-[#111111] shadow-[4px_4px_0_0_#111111]"
                        >
                            <div className="border-b-[2px] border-[#111111] bg-[#8ECAE6] px-4 py-3">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h3 className="text-lg font-black tracking-tight">
                                        v{release.version}
                                    </h3>
                                    <time className="text-[11px] font-bold uppercase tracking-wide text-[#111111]/65">
                                        {release.date}
                                    </time>
                                </div>
                                <p className="mt-1 text-sm font-semibold text-[#111111]/80">{release.summary}</p>
                            </div>
                            <div className="grid gap-4 bg-white p-4 sm:grid-cols-3">
                                <div>
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/50">
                                        Arumanis
                                    </p>
                                    <EntryList entries={release.repos.arumanis} />
                                </div>
                                <div>
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/50">
                                        APIAMIS
                                    </p>
                                    <EntryList entries={release.repos.apiamis} />
                                </div>
                                <div>
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/50">
                                        Pengawas
                                    </p>
                                    <EntryList entries={release.repos.pengawas} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </LegalSection>

            <LegalSection id="repositories" title={copy.reposTitle}>
                <p>{copy.reposIntro}</p>
                <ul className="list-none space-y-2 pl-0">
                    {REPO_LINKS.map((repo) => (
                        <li key={repo.id}>
                            <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 border-[2px] border-[#111111] bg-white px-3 py-2 text-sm font-bold shadow-[3px_3px_0_0_#111111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111111]"
                            >
                                {repo.label}
                                <ExternalLink className="h-4 w-4" aria-hidden />
                            </a>
                        </li>
                    ))}
                </ul>
            </LegalSection>

            {locale === 'en' ? (
                <LegalCallout>
                    {copy.enNote}
                </LegalCallout>
            ) : null}
        </LegalPageLayout>
    )
}