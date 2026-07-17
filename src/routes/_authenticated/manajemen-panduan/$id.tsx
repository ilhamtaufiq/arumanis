import { createFileRoute } from '@tanstack/react-router'
import PanduanEditorPage from '@/features/manajemen-panduan/components/PanduanEditorPage'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/manajemen-panduan/$id')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: PanduanEditRoute,
})

function PanduanEditRoute() {
    const { id } = Route.useParams()
    const numericId = Number(id)
    if (!Number.isFinite(numericId) || numericId <= 0) {
        return <div className="p-8 text-sm text-muted-foreground">ID tidak valid</div>
    }
    return <PanduanEditorPage id={numericId} />
}
