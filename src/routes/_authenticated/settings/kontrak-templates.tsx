import { createFileRoute, redirect } from '@tanstack/react-router';
import { requireAdmin } from '@/lib/auth-utils';

// Halaman template dokumen pindah ke /template-dokumen. Tautan lama diarahkan ke sana.
export const Route = createFileRoute('/_authenticated/settings/kontrak-templates')({
    beforeLoad: () => {
        requireAdmin();
        throw redirect({ to: '/template-dokumen' });
    },
});
