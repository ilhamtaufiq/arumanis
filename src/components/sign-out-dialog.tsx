import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-stores'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const { auth } = useAuthStore()

    const handleSignOut = () => {
        auth.reset()
        // Preserve current location for redirect after sign-in
        const currentPath = location.href
        navigate({ to: '/sign-in', search: { redirect: currentPath }, replace: true })
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
            className='sm:max-w-sm'
        />
    )
}