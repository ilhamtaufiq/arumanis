import { createFileRoute } from '@tanstack/react-router'
import RabAnalyzerPage from '@/features/rab-analyzer/components/RabAnalyzerPage'

export const Route = createFileRoute('/_authenticated/rab-analyzer/')({
    validateSearch: (search: Record<string, unknown>) => ({
        pekerjaanId: search.pekerjaanId,
    }),
    component: RabAnalyzerPage,
})