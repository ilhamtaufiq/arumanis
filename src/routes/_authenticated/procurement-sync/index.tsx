import { createFileRoute } from '@tanstack/react-router';
import SpseSyncPage from '@/features/procurement-sync/components/SpseSyncPage';

export type ProcurementSyncSearch = {
    /** Bare SPSE_SESSION value from bookmarklet */
    spse_session?: string;
    /** Optional full cookie header from advanced bookmarklet */
    spse_cookie?: string;
    /** Comma-separated visible cookie names when bookmarklet can't read SPSE_SESSION (likely HttpOnly) */
    spse_diagnose?: string;
};

export const Route = createFileRoute('/_authenticated/procurement-sync/')({
    validateSearch: (search: Record<string, unknown>): ProcurementSyncSearch => ({
        spse_session: typeof search.spse_session === 'string' ? search.spse_session : undefined,
        spse_cookie: typeof search.spse_cookie === 'string' ? search.spse_cookie : undefined,
        spse_diagnose: typeof search.spse_diagnose === 'string' ? search.spse_diagnose : undefined,
    }),
    component: SpseSyncPage,
});
