import { createFileRoute } from '@tanstack/react-router'
import PanduanEditorPage from '@/features/manajemen-panduan/components/PanduanEditorPage'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/manajemen-panduan/baru')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: () => <PanduanEditorPage />,
})
