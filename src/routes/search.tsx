import { createFileRoute } from '@tanstack/react-router'
import { GoogleSearchPage } from '@/features/search/components/GoogleSearchPage'
import { requireAnySession } from '@/lib/route-auth'

export const Route = createFileRoute('/search')({
    validateSearch: (search: Record<string, unknown>) => {
        // TanStack men-serialize string dengan quote ganda; strip agar bersih.
        const clean = (v: unknown) =>
            typeof v === 'string' ? v.replace(/^"|"$/g, '') : undefined
        return {
            q: clean(search.q),
            tahun: clean(search.tahun),
        }
    },
    beforeLoad: async () => {
        await requireAnySession()
    },
    component: GoogleSearchPage,
})
