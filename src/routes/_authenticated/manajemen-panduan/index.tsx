import { createFileRoute } from '@tanstack/react-router'
import ManajemenPanduanPage from '@/features/manajemen-panduan/components/ManajemenPanduanPage'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/manajemen-panduan/')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: ManajemenPanduanPage,
})
