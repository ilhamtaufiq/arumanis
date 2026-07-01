import { createFileRoute } from '@tanstack/react-router'
import { GoogleSearchPage } from '@/features/search/components/GoogleSearchPage'
import { requireAnySession } from '@/lib/route-auth'

export const Route = createFileRoute('/search')({
    validateSearch: (search: Record<string, unknown>) => ({
        q: typeof search.q === 'string' ? search.q : undefined,
        tahun: typeof search.tahun === 'string' ? search.tahun : undefined,
    }),
    beforeLoad: async () => {
        await requireAnySession()
    },
    component: GoogleSearchPage,
})
