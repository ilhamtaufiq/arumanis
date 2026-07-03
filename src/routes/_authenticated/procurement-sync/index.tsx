import { createFileRoute } from '@tanstack/react-router';
import SpseSyncPage from '@/features/procurement-sync/components/SpseSyncPage';

export const Route = createFileRoute('/_authenticated/procurement-sync/')({
    component: SpseSyncPage,
});