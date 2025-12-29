import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load NetworkEditorPage - contains Leaflet + EPANET.js
const NetworkEditorPage = lazy(() => import('@/features/simulation/components/NetworkEditorPage'))

function NetworkEditorWrapper() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Memuat Editor Jaringan...</span>
            </div>
        }>
            <NetworkEditorPage />
        </Suspense>
    )
}

export const Route = createFileRoute('/_authenticated/simulation/')({
    component: NetworkEditorWrapper,
})
