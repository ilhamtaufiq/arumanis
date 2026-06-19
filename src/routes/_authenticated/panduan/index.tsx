import { createFileRoute } from '@tanstack/react-router'
import { PanduanMarkdown } from '@/components/user-guide/panduan-markdown'
import { PanduanLayout } from '@/components/user-guide/panduan-layout'
import { ErrorBoundary } from '@/components/error-boundary'
import { loadDocSync, getAllDocMeta, getNavSections } from '@/lib/user-guide'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated/panduan/')({
    component: PanduanIndex,
})

function PanduanIndex() {
    const [doc, setDoc] = useState<ReturnType<typeof loadDocSync>>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        try {
            const loaded = loadDocSync('index')
            setDoc(loaded)
        } catch {
            setError(true)
        }
    }, [])

    const docs = getAllDocMeta()
    const sections = getNavSections(docs)

    if (error) {
        return (
            <PanduanLayout
                sections={sections}
                toc={[]}
                title="Panduan Pengguna"
                description="Dokumentasi aplikasi ARUMANIS"
                slug="index"
            >
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-muted-foreground">
                        Panduan pengguna belum tersedia.
                    </p>
                </div>
            </PanduanLayout>
        )
    }

    return (
        <ErrorBoundary>
            <PanduanLayout
                sections={sections}
                toc={doc?.toc ?? []}
                title={doc?.title ?? 'Panduan Pengguna'}
                description={doc?.description ?? ''}
                slug="index"
            >
                {doc ? (
                    <PanduanMarkdown content={doc.content} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-muted-foreground">Memuat panduan...</p>
                    </div>
                )}
            </PanduanLayout>
        </ErrorBoundary>
    )
}
