import { useState } from 'react'
import { Building2, ClipboardCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { redirectToPengawasWithHandoff } from '@/lib/auth-handoff'
import { cn } from '@/lib/utils'

export type DashboardDestination = 'arumanis' | 'pengawasan'

interface DashboardDestinationModalProps {
    open: boolean
    userName?: string | null
    onChooseArumanis: () => void
}

export function DashboardDestinationModal({
    open,
    userName,
    onChooseArumanis,
}: DashboardDestinationModalProps) {
    const [loading, setLoading] = useState<DashboardDestination | null>(null)

    const handleArumanis = () => {
        setLoading('arumanis')
        onChooseArumanis()
    }

    const handlePengawasan = async () => {
        setLoading('pengawasan')
        try {
            await redirectToPengawasWithHandoff()
        } catch {
            toast.error('Gagal membuka dashboard pengawasan')
            setLoading(null)
        }
    }

    return (
        <Dialog open={open}>
            <DialogContent
                className="sm:max-w-lg"
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Pilih dashboard</DialogTitle>
                    <DialogDescription>
                        {userName ? `Halo, ${userName}. ` : ''}
                        Akun Anda memiliki role operator dan pengawas. Mau masuk ke mana?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        disabled={loading !== null}
                        onClick={handleArumanis}
                        className={cn(
                            'flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                            'hover:border-primary hover:bg-primary/5',
                            'disabled:pointer-events-none disabled:opacity-60',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        )}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {loading === 'arumanis' ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Building2 className="h-5 w-5" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold">Arumanis Dashboard</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Portal operator: pekerjaan, checklist, kontrak, dan administrasi.
                            </p>
                        </div>
                        <Button variant="secondary" size="sm" className="mt-auto w-full" tabIndex={-1}>
                            Buka Arumanis
                        </Button>
                    </button>

                    <button
                        type="button"
                        disabled={loading !== null}
                        onClick={() => void handlePengawasan()}
                        className={cn(
                            'flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                            'hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
                            'disabled:pointer-events-none disabled:opacity-60',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        )}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {loading === 'pengawasan' ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ClipboardCheck className="h-5 w-5" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold">Dashboard Pengawasan</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Aplikasi lapangan pengawas: progres, dokumentasi, dan laporan.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-auto w-full border-emerald-200"
                            tabIndex={-1}
                        >
                            Buka Pengawasan
                        </Button>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
