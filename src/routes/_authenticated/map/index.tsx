import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

type MapSearch = {
    search?: string
    tahun?: string
}

import { lazyImport } from '@/lib/utils'

// Lazy load MapPage - contains Leaflet maps (~150KB)
const MapPage = lazy(() => lazyImport(() => import('@/features/map/components/MapPage'), 'map-page'))

function MapPageWrapper() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Memuat Peta...</span>
            </div>
        }>
            <MapPage />
        </Suspense>
    )
}

export const Route = createFileRoute('/_authenticated/map/')({
    validateSearch: (search: Record<string, unknown>): MapSearch => ({
        search: typeof search.search === 'string' ? search.search : undefined,
        tahun: typeof search.tahun === 'string' ? search.tahun : undefined,
    }),
    component: MapPageWrapper,
})
