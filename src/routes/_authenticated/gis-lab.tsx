import { createFileRoute } from '@tanstack/react-router'
import { GisAppRedirect } from '@/components/common/GisAppRedirect'

export const Route = createFileRoute('/_authenticated/gis-lab')({
    component: GisLabPage,
})

function GisLabPage() {
    return <GisAppRedirect />
}
