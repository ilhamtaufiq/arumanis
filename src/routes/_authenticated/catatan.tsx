import { createFileRoute } from '@tanstack/react-router'
import { CatatanPage } from '@/features/catatan/components/CatatanPage'

export const Route = createFileRoute('/_authenticated/catatan')({
    component: CatatanPage,
})
