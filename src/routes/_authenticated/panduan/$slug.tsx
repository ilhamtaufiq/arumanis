import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

/**
 * Map /panduan/:slug → /docs/:slug (Fumadocs).
 */
export const Route = createFileRoute('/_authenticated/panduan/$slug')({
    component: PanduanSlugRedirect,
})

function PanduanSlugRedirect() {
    const { slug } = Route.useParams()
    const target = slug === 'index' ? '/docs/' : `/docs/${slug}`

    useEffect(() => {
        window.location.replace(target)
    }, [target])

    return (
        <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-muted-foreground">
            Mengalihkan ke Pusat Bantuan…
            <a href={target} className="ml-2 underline">
                Buka {target}
            </a>
        </div>
    )
}
