import { createFileRoute } from '@tanstack/react-router';
import MailTemplatesPage from '@/features/settings/components/MailTemplatesPage';
import { requireAdmin } from '@/lib/auth-utils';

export const Route = createFileRoute('/_authenticated/settings/email-templates')({
    beforeLoad: () => {
        requireAdmin();
    },
    component: MailTemplatesPage,
});