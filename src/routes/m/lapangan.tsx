import { createFileRoute } from '@tanstack/react-router'
import { LapanganScreen } from '@/features/mobile/screens/LapanganScreen'

export const Route = createFileRoute('/m/lapangan')({
    component: LapanganScreen,
})
