import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SpamUnitPage } from '@/features/spam-unit'

export type SpamUnitSearch = {
    desa_id?: number
    tahun?: string
    tab?: 'spm' | 'kelembagaan' | 'integration' | 'master'
    q?: string
}

function parseSpamUnitSearch(search: Record<string, unknown>): SpamUnitSearch {
    const desaRaw = search.desa_id
    const desa_id =
        desaRaw != null && desaRaw !== '' && Number.isFinite(Number(desaRaw))
            ? Number(desaRaw)
            : undefined
    const tahun =
        typeof search.tahun === 'string'
            ? search.tahun
            : search.tahun != null
              ? String(search.tahun)
              : undefined
    const tabRaw = typeof search.tab === 'string' ? search.tab : undefined
    const tab =
        tabRaw === 'spm' ||
        tabRaw === 'kelembagaan' ||
        tabRaw === 'integration' ||
        tabRaw === 'master'
            ? tabRaw
            : undefined
    const q = typeof search.q === 'string' ? search.q : undefined
    return { desa_id, tahun, tab, q }
}

export const Route = createFileRoute('/_authenticated/spam-unit/')({
    validateSearch: (search: Record<string, unknown>) => parseSpamUnitSearch(search),
    component: SpamUnitRoute,
})

function SpamUnitRoute() {
    const search = Route.useSearch()
    return (
        <>
            <Header fixed />
            <Main>
                <SpamUnitPage initialSearch={search} />
            </Main>
        </>
    )
}
