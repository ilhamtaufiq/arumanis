import { createFileRoute } from '@tanstack/react-router';
import KontrakTemplatesPage from '@/features/settings/components/KontrakTemplatesPage';
import { requireAdmin } from '@/lib/auth-utils';

export const Route = createFileRoute('/_authenticated/template-dokumen')({
    beforeLoad: () => {
        requireAdmin();
    },
    component: KontrakTemplatesPage,
});
