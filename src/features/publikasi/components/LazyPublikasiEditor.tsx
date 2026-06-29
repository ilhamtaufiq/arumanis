import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import type { PublikasiEditorProps } from '@/features/publikasi/components/PublikasiEditor'

const PublikasiEditorLazy = lazy(() =>
    lazyImport(
        () => import('@/features/publikasi/components/PublikasiEditor').then((m) => ({ default: m.PublikasiEditor })),
        'publikasi-editor',
    ),
)

export function LazyPublikasiEditor(props: PublikasiEditorProps) {
    return (
        <RouteSuspense label="Memuat editor...">
            <PublikasiEditorLazy {...props} />
        </RouteSuspense>
    )
}