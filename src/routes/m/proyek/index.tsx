import { createFileRoute } from '@tanstack/react-router'
import { ProyekScreen } from '@/features/mobile/screens/ProyekScreen'

export const Route = createFileRoute('/m/proyek/')({
    component: ProyekScreen,
})
