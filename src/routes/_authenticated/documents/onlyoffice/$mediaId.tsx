import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import OnlyOfficeViewerPage from '@/features/documents/components/OnlyOfficeViewerPage';

const onlyOfficeViewerSearchSchema = z.object({
    title: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/documents/onlyoffice/$mediaId')({
    validateSearch: onlyOfficeViewerSearchSchema,
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan/:pekerjaan" requiredMethod="GET">
            <OnlyOfficeViewerPage />
        </ProtectedRoute>
    ),
});