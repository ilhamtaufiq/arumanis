import { createFileRoute } from '@tanstack/react-router'
import { ProfilScreen } from '@/features/mobile/screens/ProfilScreen'

export const Route = createFileRoute('/m/profil')({
    component: ProfilScreen,
})
