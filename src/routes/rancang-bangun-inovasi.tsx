import { createFileRoute } from '@tanstack/react-router'
import { RancangBangunInovasi } from '@/features/public/rancang-bangun-inovasi'

export const Route = createFileRoute('/rancang-bangun-inovasi')({
    component: RancangBangunInovasi,
})