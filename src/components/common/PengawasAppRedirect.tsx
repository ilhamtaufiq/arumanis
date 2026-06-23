import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'
import { getPengawasAppUrl } from '@/lib/pengawas-app'

export function PengawasAppRedirect() {
    const accessToken = useAuthStore((state) => state.auth.accessToken)

    useEffect(() => {
        // Redirect only once on mount to avoid triggering on token changes
        // (e.g. during impersonation stop which can cause redirect loops)
        window.location.href = getPengawasAppUrl(accessToken)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    Mengalihkan ke aplikasi pengawas...
                </p>
            </div>
        </div>
    )
}