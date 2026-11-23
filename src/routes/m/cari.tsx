import { createFileRoute } from '@tanstack/react-router'
import { MobileSearchPage } from '@/features/mobile/components/MobileSearchPage'

export const Route = createFileRoute('/m/cari')({
    component: MobileSearchPage,
})
