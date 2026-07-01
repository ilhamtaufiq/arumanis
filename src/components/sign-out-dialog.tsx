import { useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-stores'
import { logout } from '@/features/auth/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const { auth } = useAuthStore()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await logout()
        } catch {
            // Tetap bersihkan state lokal meski request gagal
        } finally {
            auth.reset()
            setIsSigningOut(false)
            onOpenChange(false)
            const currentPath = location.href
            navigate({ to: '/sign-in', search: { redirect: currentPath }, replace: true })
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title='Keluar'
            desc='Yakin mau keluar? Kamu harus login lagi nanti buat masuk.'
            confirmText='Keluar'
            destructive
            handleConfirm={handleSignOut}
            isLoading={isSigningOut}
            className='sm:max-w-sm'
        />
    )
}
