import { Suspense, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type RouteSuspenseProps = {
    label: string
    children: ReactNode
}

export function RouteSuspense({ label, children }: RouteSuspenseProps) {
    return (
        <Suspense
            fallback={(
                <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">{label}</span>
                </div>
            )}
        >
            {children}
        </Suspense>
    )
}