import { createFileRoute } from '@tanstack/react-router';
import BuatLaporanList from '@/features/buat-laporan/components/BuatLaporanList';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/_authenticated/buat-laporan/')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <BuatLaporanList />
        </ProtectedRoute>
    ),
});