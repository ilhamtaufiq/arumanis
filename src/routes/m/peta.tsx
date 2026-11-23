import { createFileRoute } from '@tanstack/react-router'
import { MobilePlaceholder } from '@/features/mobile/components/MobilePlaceholder'

export const Route = createFileRoute('/m/peta')({
    component: () => <MobilePlaceholder judul="peta" />,
})
