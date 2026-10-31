import { createFileRoute } from '@tanstack/react-router';
import BukuKontrakPage from '@/features/buku-kontrak/components/BukuKontrakPage';
import { requireAdmin } from '@/lib/auth-utils';

export const Route = createFileRoute('/_authenticated/buku-kontrak')({
    beforeLoad: () => {
        requireAdmin();
    },
    component: BukuKontrakPage,
});
