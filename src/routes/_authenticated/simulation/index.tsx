import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { lazyImport } from '@/lib/utils'

const NetworkEditorPage = lazy(() =>
    lazyImport(() => import('@/features/simulation/components/NetworkEditorPage'), 'network-editor'),
)

export type SimulationSearch = {
    pekerjaanId?: number
    networkId?: number
}

function NetworkEditorWrapper() {
    return (
        <ProtectedRoute requiredPath="/simulation-networks" requiredMethod="GET">
            <RouteSuspense label="Memuat Editor Jaringan...">
                <NetworkEditorPage />
            </RouteSuspense>
        </ProtectedRoute>
    )
}

export const Route = createFileRoute('/_authenticated/simulation/')({
    validateSearch: (search: Record<string, unknown>): SimulationSearch => {
        const pekerjaanId = search.pekerjaanId != null ? Number(search.pekerjaanId) : undefined
        const networkId = search.networkId != null ? Number(search.networkId) : undefined
        return {
            pekerjaanId: pekerjaanId && !Number.isNaN(pekerjaanId) ? pekerjaanId : undefined,
            networkId: networkId && !Number.isNaN(networkId) ? networkId : undefined,
        }
    },
    component: NetworkEditorWrapper,
})