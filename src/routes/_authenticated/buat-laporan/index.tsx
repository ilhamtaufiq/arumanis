import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { RouteSuspense } from '@/components/route-suspense';
import { lazyImport } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const BuatLaporanList = lazy(() =>
    lazyImport(() => import('@/features/buat-laporan/components/BuatLaporanList'), 'buat-laporan'),
);

export const Route = createFileRoute('/_authenticated/buat-laporan/')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <RouteSuspense label="Memuat Laporan...">
                <BuatLaporanList />
            </RouteSuspense>
        </ProtectedRoute>
    ),
});