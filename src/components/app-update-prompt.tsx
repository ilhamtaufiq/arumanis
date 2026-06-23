import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppVersionCheck } from '@/hooks/use-app-version-check'
import { hardReloadApp } from '@/lib/app-cache'

export function AppUpdatePrompt() {
    const { updateAvailable, remote, isChecking, dismissUpdate } = useAppVersionCheck()
    const [isReloading, setIsReloading] = useState(false)

    if (!updateAvailable || !remote) {
        return null
    }

    const handleReload = async () => {
        setIsReloading(true)
        await hardReloadApp()
    }

    return (
        <div className="fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-xl border bg-card p-4 shadow-lg">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <RefreshCw className={`h-4 w-4 ${isChecking || isReloading ? 'animate-spin' : ''}`} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Versi baru tersedia</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Build terbaru sudah dirilis. Klik tombol di bawah untuk langsung memuat versi baru.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={handleReload} disabled={isReloading}>
                            {isReloading ? 'Memuat ulang...' : 'Muat Versi Baru'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={dismissUpdate} disabled={isReloading}>
                            Nanti
                        </Button>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={dismissUpdate}
                    disabled={isReloading}
                    aria-label="Tutup notifikasi update"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}