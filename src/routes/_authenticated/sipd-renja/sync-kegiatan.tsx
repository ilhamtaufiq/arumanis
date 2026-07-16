import { createFileRoute } from '@tanstack/react-router'
import SipdKegiatanSyncPage from '@/features/sipd-renja/components/SipdKegiatanSyncPage'

export const Route = createFileRoute('/_authenticated/sipd-renja/sync-kegiatan')({
    component: SipdKegiatanSyncPage,
})
