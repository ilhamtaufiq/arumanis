import { RefreshCw } from 'lucide-react'
import { useAppVersionCheck } from '@/hooks/use-app-version-check'

export function AppUpdateOverlay() {
    const { isReloading } = useAppVersionCheck()

    if (!isReloading) {
        return null
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-lg">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <div>
                    <p className="text-sm font-semibold">Memperbarui aplikasi</p>
                    <p className="text-xs text-muted-foreground">Versi terbaru sedang dimuat...</p>
                </div>
            </div>
        </div>
    )
}