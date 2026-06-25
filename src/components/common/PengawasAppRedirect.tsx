import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'
import { getPengawasAppUrl } from '@/lib/pengawas-app'

export function PengawasAppRedirect() {
    const accessToken = useAuthStore((state) => state.auth.accessToken)
    const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)

    useEffect(() => {
        if (isImpersonating) {
            return
        }

        if (window.location.pathname.startsWith('/pengawasan')) {
            return
        }

        window.location.replace(getPengawasAppUrl(accessToken))
    }, [accessToken, isImpersonating])

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