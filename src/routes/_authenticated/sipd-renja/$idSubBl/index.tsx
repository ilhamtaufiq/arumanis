import { createFileRoute } from '@tanstack/react-router'
import { SipdRincianPage } from '@/features/sipd-renja/components/SipdRincianPage'

export const Route = createFileRoute('/_authenticated/sipd-renja/$idSubBl/')({
    component: SipdRincianPage,
})