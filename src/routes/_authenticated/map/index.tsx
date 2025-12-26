import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load MapPage - contains Leaflet maps (~150KB)
const MapPage = lazy(() => import('@/features/map/components/MapPage'))

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
    component: MapPageWrapper,
})
