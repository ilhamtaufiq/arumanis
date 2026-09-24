import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { RouteSuspense } from '@/components/route-suspense';
import { lazyImport } from '@/lib/utils';

const PengawasList = lazy(() =>
    lazyImport(() => import('@/features/pengawas/components/PengawasList'), 'pengawas'),
);

function PengawasListWrapper() {
    return (
        <RouteSuspense label="Memuat Pengawas...">
            <PengawasList />
        </RouteSuspense>
    );
}

export const Route = createFileRoute('/_authenticated/pengawas')({
    component: PengawasListWrapper,
});
