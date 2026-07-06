import { createFileRoute } from '@tanstack/react-router'
import SipdRenjaPage from '@/features/sipd-renja/components/SipdRenjaPage'

export const Route = createFileRoute('/_authenticated/sipd-renja/')({
    component: SipdRenjaPage,
})