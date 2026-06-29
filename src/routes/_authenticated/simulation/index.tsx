import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const NetworkEditorPage = lazy(() =>
    lazyImport(() => import('@/features/simulation/components/NetworkEditorPage'), 'network-editor'),
)

function NetworkEditorWrapper() {
    return (
        <RouteSuspense label="Memuat Editor Jaringan...">
            <NetworkEditorPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/simulation/')({
    component: NetworkEditorWrapper,
})
