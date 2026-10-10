import { createFileRoute } from '@tanstack/react-router'
import JurnalKegiatanPage from '@/features/jurnal-kegiatan/components/JurnalKegiatanPage'

export const Route = createFileRoute('/_authenticated/jurnal-kegiatan')({
    component: JurnalKegiatanPage,
})
