import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSpamUnit } from '../api'
import { spamIntegrationKeys } from '../hooks/useSpamIntegration'
import type { IntegrationUnit } from '../types'

interface SpamCreateUnitDialogProps {
    desaId: number
    desaName: string
    kecamatanName?: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreated?: (unit: IntegrationUnit) => void
}

const defaultForm = (desaName: string) => ({
    name: `SPAM Desa ${desaName}`,
    pokmas: '',
    kepala: '',
    is_simspam: false,
})

export function SpamCreateUnitDialog({
    desaId,
    desaName,
    kecamatanName,
    open,
    onOpenChange,
    onCreated,
}: SpamCreateUnitDialogProps) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState(defaultForm(desaName))

    useEffect(() => {
        if (open) {
            setForm(defaultForm(desaName))
        }
    }, [open, desaName])

    const createMutation = useMutation({
        mutationFn: createSpamUnit,
        onSuccess: async (res) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['spam-units'] }),
                queryClient.invalidateQueries({ queryKey: spamIntegrationKeys.all }),
                queryClient.invalidateQueries({
                    queryKey: ['spam-integration-desa', desaId],
                }),
                queryClient.invalidateQueries({ queryKey: ['spam-units-stats'] }),
            ])
            toast.success('Unit SPAM berhasil dibuat. Anda dapat menautkan pekerjaan.')
            onOpenChange(false)

            const created = res.data
            onCreated?.({
                id: created.id,
                name: created.name,
                is_simspam: created.is_simspam,
                sistem_layanan: created.sistem_layanan,
                pokmas: form.pokmas || created.pengelola?.pokmas,
                kepala: form.kepala || created.pengelola?.kepala,
                linked_pekerjaan_count: 0,
            })
        },
        onError: () => {
            toast.error('Gagal membuat unit SPAM.')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMutation.mutate({
            desa_id: desaId,
            name: form.name.trim() || `SPAM Desa ${desaName}`,
            is_simspam: form.is_simspam,
            pokmas: form.pokmas.trim() || undefined,
            kepala: form.kepala.trim() || undefined,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Buat Unit SPAM</DialogTitle>
                    <DialogDescription>
                        {desaName}
                        {kecamatanName ? `, ${kecamatanName}` : ''}. Unit diperlukan agar paket
                        pekerjaan air minum dapat ditautkan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="spam-unit-name">Nama Unit SPAM</Label>
                        <Input
                            id="spam-unit-name"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder={`SPAM Desa ${desaName}`}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="spam-unit-pokmas">Nama POKMAS</Label>
                        <Input
                            id="spam-unit-pokmas"
                            value={form.pokmas}
                            onChange={(e) => setForm((f) => ({ ...f, pokmas: e.target.value }))}
                            placeholder="e.g. KPSPAM ..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="spam-unit-kepala">Ketua / Kepala POKMAS</Label>
                        <Input
                            id="spam-unit-kepala"
                            value={form.kepala}
                            onChange={(e) => setForm((f) => ({ ...f, kepala: e.target.value }))}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.is_simspam}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, is_simspam: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-input"
                        />
                        Terverifikasi SIMSPAM
                    </label>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createMutation.isPending}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Buat & Lanjut Tautkan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}