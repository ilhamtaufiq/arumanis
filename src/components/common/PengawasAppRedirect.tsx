import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'
import { redirectToPengawasWithHandoff } from '@/lib/auth-handoff'

export function PengawasAppRedirect() {
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)
    const isImpersonating = useAuthStore((state) => state.auth.isImpersonating)

    useEffect(() => {
        if (!isSessionActive || isImpersonating) {
            return
        }

        if (window.location.pathname.startsWith('/pengawasan')) {
            return
        }

        void redirectToPengawasWithHandoff().catch(() => {
            window.location.replace('/dashboard')
        })
    }, [isSessionActive, isImpersonating])

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