import { createFileRoute } from '@tanstack/react-router'
import { ProgresScreen } from '@/features/mobile/screens/ProgresScreen'

export const Route = createFileRoute('/m/progres')({
    component: ProgresScreen,
})
