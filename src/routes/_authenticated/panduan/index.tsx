import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * In-app panduan is replaced by Fumadocs at /docs.
 * Keep the route so bookmarks / sidebar links still resolve.
 */
export const Route = createFileRoute('/_authenticated/panduan/')({
    beforeLoad: () => {
        throw redirect({
            href: '/docs/',
            // external-style navigation (full page to Fumadocs SPA)
        } as never)
    },
    component: PanduanRedirect,
})

function PanduanRedirect() {
    if (typeof window !== 'undefined') {
        window.location.replace('/docs/')
    }
    return (
        <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-muted-foreground">
            Mengalihkan ke Pusat Bantuan…
            <a href="/docs/" className="ml-2 underline">
                Buka /docs
            </a>
        </div>
    )
}
