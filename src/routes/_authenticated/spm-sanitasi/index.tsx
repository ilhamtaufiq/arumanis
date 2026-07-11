import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SpmSanitasiPage } from '@/features/spm-sanitasi'
import type { SpmSanitasiJenis } from '@/features/spm-sanitasi/types'

export type SpmSanitasiSearch = {
    desa_id?: number
    tahun?: string
    jenis?: SpmSanitasiJenis
    tab?: 'data' | 'integration'
    q?: string
}

const JENIS_SET = new Set<string>([
    'spaldt',
    'spalds',
    'iplt',
    'mck_individu',
    'mck_komunal',
])

function parseSpmSearch(search: Record<string, unknown>): SpmSanitasiSearch {
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
    const jenisRaw = typeof search.jenis === 'string' ? search.jenis : undefined
    const jenis =
        jenisRaw && JENIS_SET.has(jenisRaw) ? (jenisRaw as SpmSanitasiJenis) : undefined
    const tabRaw = typeof search.tab === 'string' ? search.tab : undefined
    const tab = tabRaw === 'data' || tabRaw === 'integration' ? tabRaw : undefined
    const q = typeof search.q === 'string' ? search.q : undefined
    return { desa_id, tahun, jenis, tab, q }
}

export const Route = createFileRoute('/_authenticated/spm-sanitasi/')({
    validateSearch: (search: Record<string, unknown>) => parseSpmSearch(search),
    component: SpmSanitasiRoute,
})

function SpmSanitasiRoute() {
    const search = Route.useSearch()
    return (
        <>
            <Header fixed />
            <Main>
                <SpmSanitasiPage initialSearch={search} />
            </Main>
        </>
    )
}
