import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const ChecklistPage = lazy(() =>
    lazyImport(() => import('@/features/checklist/components/ChecklistPage'), 'checklist'),
)

function ChecklistPageWrapper() {
    return (
        <RouteSuspense label="Memuat Checklist...">
            <ChecklistPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/checklist')({
    component: ChecklistPageWrapper,
})
