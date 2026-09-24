import { Suspense, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

type RouteSuspenseProps = {
    label: string
    children: ReactNode
}

/**
 * Fallback berupa kerangka halaman (bukan spinner di ruang kosong)
 * agar pindah halaman tidak terlihat seperti blank putih.
 */
export function RouteSuspense({ label, children }: RouteSuspenseProps) {
    return (
        <Suspense
            fallback={(
                <div
                    aria-label={label}
                    aria-busy="true"
                    className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5"
                >
                    <div className="flex w-full min-w-0 flex-col gap-4">
                        <div>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="mt-2 h-4 w-64" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {[0, 1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                </div>
            )}
        >
            {children}
        </Suspense>
    )
}
