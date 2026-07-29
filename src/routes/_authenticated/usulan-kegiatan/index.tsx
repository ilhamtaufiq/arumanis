import { createFileRoute } from '@tanstack/react-router'
import UsulanKegiatanPage from '@/features/usulan-kegiatan/components/UsulanKegiatanPage'

export const Route = createFileRoute('/_authenticated/usulan-kegiatan/')({
    component: UsulanKegiatanPage,
})
