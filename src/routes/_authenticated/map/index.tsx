import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

type MapSearch = {
    search?: string
    tahun?: string
}

const MapPage = lazy(() => lazyImport(() => import('@/features/map/components/MapPage'), 'map-page'))

function MapPageWrapper() {
    return (
        <RouteSuspense label="Memuat Peta...">
            <MapPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/map/')({
    validateSearch: (search: Record<string, unknown>): MapSearch => ({
        search: typeof search.search === 'string' ? search.search : undefined,
        tahun: typeof search.tahun === 'string' ? search.tahun : undefined,
    }),
    component: MapPageWrapper,
})
