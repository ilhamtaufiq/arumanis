import { createFileRoute } from '@tanstack/react-router'
import DataQualityQueuePage from '@/features/data-quality/components/DataQualityQueuePage'

export const Route = createFileRoute('/_authenticated/data-quality/')({
    validateSearch: (search: Record<string, unknown>) => ({
        issue: typeof search.issue === 'string' ? search.issue : undefined,
        tahun: typeof search.tahun === 'string' ? search.tahun : undefined,
    }),
    component: DataQualityQueuePage,
})
