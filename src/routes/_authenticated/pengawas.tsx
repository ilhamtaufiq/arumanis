import { createFileRoute } from '@tanstack/react-router';
import PengawasList from '@/features/pengawas/components/PengawasList';

export const Route = createFileRoute('/_authenticated/pengawas')({
    component: PengawasList,
});
