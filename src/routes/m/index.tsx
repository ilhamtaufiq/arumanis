import { createFileRoute } from '@tanstack/react-router'
import { BerandaScreen } from '@/features/mobile/screens/BerandaScreen'

export const Route = createFileRoute('/m/')({
    component: BerandaScreen,
})
