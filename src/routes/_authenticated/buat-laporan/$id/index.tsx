import { createFileRoute } from '@tanstack/react-router';
import BuatLaporanPage from '@/features/buat-laporan/components/BuatLaporanPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/_authenticated/buat-laporan/$id/')({
    validateSearch: (search: Record<string, unknown>) => ({
        importRab: search.importRab,
    }),
    component: () => (
        <ProtectedRoute requiredPath="/progress/pekerjaan/:pekerjaanId" requiredMethod="GET">
            <BuatLaporanPage />
        </ProtectedRoute>
    ),
});