import { createFileRoute } from '@tanstack/react-router'
import PekerjaanForm from '@/features/pekerjaan/components/PekerjaanForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/new')({
  validateSearch: (search: Record<string, unknown>) => ({
    sipd_nama_paket: typeof search.sipd_nama_paket === 'string' ? search.sipd_nama_paket : undefined,
    sipd_kode_rekening:
      typeof search.sipd_kode_rekening === 'string' ? search.sipd_kode_rekening : undefined,
    sipd_pagu: typeof search.sipd_pagu === 'string' ? search.sipd_pagu : undefined,
    sipd_kode_sub_giat:
      typeof search.sipd_kode_sub_giat === 'string' ? search.sipd_kode_sub_giat : undefined,
    sipd_nama_sub: typeof search.sipd_nama_sub === 'string' ? search.sipd_nama_sub : undefined,
    sipd_id_sub_bl: typeof search.sipd_id_sub_bl === 'string' ? search.sipd_id_sub_bl : undefined,
    sipd_id_rinci: typeof search.sipd_id_rinci === 'string' ? search.sipd_id_rinci : undefined,
  }),
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="POST">
      <PekerjaanForm />
    </ProtectedRoute>
  ),
})
