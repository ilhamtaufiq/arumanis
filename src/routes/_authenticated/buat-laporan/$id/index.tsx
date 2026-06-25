import { createFileRoute } from '@tanstack/react-router';
import BuatLaporanPage from '@/features/buat-laporan/components/BuatLaporanPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/_authenticated/buat-laporan/$id/')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan/:pekerjaan" requiredMethod="GET">
            <BuatLaporanPage />
        </ProtectedRoute>
    ),
});