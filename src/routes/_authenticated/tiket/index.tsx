import { createFileRoute } from '@tanstack/react-router'
import TiketPage from '@/features/tiket/components/TiketPage'

export const Route = createFileRoute('/_authenticated/tiket/')({
    component: TiketPage,
})
