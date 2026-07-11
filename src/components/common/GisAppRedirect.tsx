import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'
import { redirectToGisWithHandoff } from '@/lib/auth-handoff'
import { isGisAppPathname } from '@/lib/gis-app'
import { Button } from '@/components/ui/button'

export function GisAppRedirect() {
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)
    const [error, setError] = useState<string | null>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        if (!isSessionActive) {
            return
        }

        // Portal route is /gis-lab — do not treat it as already-inside GIS app
        // (`'/gis-lab'.startsWith('/gis')` was true and blocked redirect forever).
        if (isGisAppPathname(window.location.pathname)) {
            return
        }

        let cancelled = false
        setError(null)

        void redirectToGisWithHandoff()
            .catch((err: unknown) => {
                if (cancelled) return
                const message =
                    err instanceof Error ? err.message : 'Gagal membuka Arumanis GIS'
                setError(message)
            })

        return () => {
            cancelled = true
        }
    }, [isSessionActive, attempt])

    if (!isSessionActive) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Menunggu sesi login…</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[60vh] items-center justify-center p-4">
                <div className="flex max-w-md flex-col items-center gap-3 text-center">
                    <p className="text-sm font-medium text-destructive">Gagal membuka Lab GIS</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <p className="text-xs text-muted-foreground">
                        Pastikan Arumanis GIS berjalan (`cd www/arumanis-gis && bun run dev`) di port 3100.
                    </p>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={() => setAttempt((n) => n + 1)}>
                            Coba lagi
                        </Button>
                        <Button type="button" size="sm" variant="outline" asChild>
                            <a href="/map">Kembali ke peta</a>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Mengalihkan ke Arumanis GIS…</p>
            </div>
        </div>
    )
}
