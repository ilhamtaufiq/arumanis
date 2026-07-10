import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Link2, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { createKelembagaanShareLink } from '../api'
import type { UnitSpam } from '../types'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface SpamKelembagaanShareDialogProps {
    unit: UnitSpam | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SpamKelembagaanShareDialog({
    unit,
    open,
    onOpenChange,
}: SpamKelembagaanShareDialogProps) {
    const queryClient = useQueryClient()
    const [label, setLabel] = useState('')
    const [expiresDays, setExpiresDays] = useState('30')
    const [maxSubmissions, setMaxSubmissions] = useState('')
    const [createdUrl, setCreatedUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const mutation = useMutation({
        mutationFn: createKelembagaanShareLink,
        onSuccess: (res) => {
            const path = res.data.path
            const url = `${window.location.origin}${path}`
            setCreatedUrl(url)
            queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-share-links'] })
            toast.success('Link form berhasil dibuat')
        },
        onError: () => toast.error('Gagal membuat link form'),
    })

    const handleCreate = () => {
        if (!unit) return
        const days = Number(expiresDays)
        const expires_at =
            Number.isFinite(days) && days > 0
                ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
                : undefined
        const max = maxSubmissions.trim() ? Number(maxSubmissions) : undefined

        mutation.mutate({
            unit_spam_id: unit.id,
            label: label.trim() || undefined,
            expires_at,
            max_submissions: max && max > 0 ? max : undefined,
        })
    }

    const handleCopy = async () => {
        if (!createdUrl) return
        try {
            await navigator.clipboard.writeText(createdUrl)
            setCopied(true)
            toast.success('Link disalin')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Gagal menyalin link')
        }
    }

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setCreatedUrl(null)
            setLabel('')
            setExpiresDays('30')
            setMaxSubmissions('')
            setCopied(false)
        }
        onOpenChange(next)
    }

    const desa = unit?.desa?.n_desa || unit?.desa?.nama_desa || '-'
    const kec = unit?.desa?.kecamatan?.n_kec || unit?.desa?.kecamatan?.nama_kecamatan || '-'

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Bagikan Form Kelembagaan
                    </DialogTitle>
                    <DialogDescription>
                        Buat link agar petugas lapangan mengisi/memperbarui data POKMAS tanpa login.
                        Perubahan masuk antrean dan baru diterapkan setelah diverifikasi admin.
                    </DialogDescription>
                </DialogHeader>

                {unit ? (
                    <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                        <p className="font-medium">{unit.name || `Unit #${unit.id}`}</p>
                        <p className="text-xs text-muted-foreground">
                            {kec} · Desa {desa}
                        </p>
                    </div>
                ) : null}

                {!createdUrl ? (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="share-label">Label (opsional)</Label>
                            <Input
                                id="share-label"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="mis. Update POKMAS Cianjur 2026"
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="share-expires">Berlaku (hari)</Label>
                                <Input
                                    id="share-expires"
                                    type="number"
                                    min={1}
                                    value={expiresDays}
                                    onChange={(e) => setExpiresDays(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="share-max">Maks. usulan (opsional)</Label>
                                <Input
                                    id="share-max"
                                    type="number"
                                    min={1}
                                    value={maxSubmissions}
                                    onChange={(e) => setMaxSubmissions(e.target.value)}
                                    placeholder="Tanpa batas"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label>Link form publik</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={createdUrl} className="font-mono text-xs" />
                            <Button type="button" variant="outline" size="icon" onClick={() => void handleCopy()}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bagikan link ini ke pengelola POKMAS. Usulan tidak langsung mengubah master data.
                        </p>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                        Tutup
                    </Button>
                    {!createdUrl ? (
                        <Button type="button" onClick={handleCreate} disabled={!unit || mutation.isPending}>
                            {mutation.isPending ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                                <Link2 className="mr-1 h-4 w-4" />
                            )}
                            Buat link
                        </Button>
                    ) : (
                        <Button type="button" onClick={() => void handleCopy()}>
                            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                            Salin link
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
