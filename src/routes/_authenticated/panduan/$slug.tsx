import { createFileRoute, Link } from '@tanstack/react-router'
import { PanduanMarkdown } from '@/components/user-guide/panduan-markdown'
import { PanduanLayout } from '@/components/user-guide/panduan-layout'
import { ErrorBoundary } from '@/components/error-boundary'
import { loadDocSync, getAllDocMeta, getNavSections } from '@/lib/user-guide'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated/panduan/$slug')({
    component: PanduanDoc,
})

function PanduanDoc() {
    const { slug } = Route.useParams()
    const [doc, setDoc] = useState<ReturnType<typeof loadDocSync>>(null)
    const [notFound, setNotFound] = useState(false)
    const [loadError, setLoadError] = useState(false)

    useEffect(() => {
        setDoc(null)
        setNotFound(false)
        setLoadError(false)
        try {
            const loaded = loadDocSync(slug)
            if (!loaded) {
                setNotFound(true)
                return
            }
            setDoc(loaded)
        } catch {
            setLoadError(true)
        }
    }, [slug])

    const docs = getAllDocMeta()
    const sections = getNavSections(docs)

    if (notFound) {
        return (
            <PanduanLayout
                sections={sections}
                toc={[]}
                title="Halaman Tidak Ditemukan"
                description="Panduan yang Anda cari tidak tersedia"
                slug={slug}
            >
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="text-2xl font-semibold mb-2">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Panduan dengan judul &quot;{slug}&quot; tidak ditemukan.
                    </p>
                    <Link
                        to="/panduan"
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        Kembali ke daftar panduan
                    </Link>
                </div>
            </PanduanLayout>
        )
    }

    if (loadError) {
        return (
            <PanduanLayout
                sections={sections}
                toc={[]}
                title="Terjadi Kesalahan"
                description="Gagal memuat panduan"
                slug={slug}
            >
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="text-2xl font-semibold mb-2">
                        Gagal Memuat Halaman
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Terjadi kesalahan saat memuat panduan. Silakan coba lagi.
                    </p>
                    <Link
                        to="/panduan"
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        Kembali ke daftar panduan
                    </Link>
                </div>
            </PanduanLayout>
        )
    }

    return (
        <ErrorBoundary>
            <PanduanLayout
                sections={sections}
                toc={doc?.toc ?? []}
                title={doc?.title ?? 'Memuat...'}
                description={doc?.description ?? ''}
                slug={slug}
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
