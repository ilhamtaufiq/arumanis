import { useState } from 'react'
import { KeyRound, Plus, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { AccessPageShell, AccessSection } from '@/components/shared/AccessSecurityShell'
import { API_KEY_SCOPES, type ApiKey, type ApiKeyScope, type ApiKeyStatus } from '../types'
import { useApiKeysList, useCreateApiKey, useRevokeApiKey } from '../hooks/useApiKeys'

const STATUS_VARIANT: Record<ApiKeyStatus, 'default' | 'secondary' | 'destructive'> = {
    aktif: 'default',
    kedaluwarsa: 'secondary',
    dicabut: 'destructive',
}

function formatDate(value: string | null): string {
    if (!value) return '-'
    return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ApiKeyList() {
    const { data, isLoading } = useApiKeysList()
    const createMutation = useCreateApiKey()
    const revokeMutation = useRevokeApiKey()

    const [createOpen, setCreateOpen] = useState(false)
    const [name, setName] = useState('')
    const [scopes, setScopes] = useState<ApiKeyScope[]>([])
    const [expiresDays, setExpiresDays] = useState('')
    const [createdKey, setCreatedKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)

    const keys = data?.data ?? []

    function resetForm() {
        setName('')
        setScopes([])
        setExpiresDays('')
    }

    function toggleScope(scope: ApiKeyScope, checked: boolean) {
        setScopes((prev) => (checked ? [...prev, scope] : prev.filter((s) => s !== scope)))
    }

    function handleCreate() {
        const days = expiresDays.trim() === '' ? null : Number(expiresDays)
        createMutation.mutate(
            { name: name.trim(), scopes, expires_days: days },
            {
                onSuccess: (res) => {
                    setCreateOpen(false)
                    resetForm()
                    setCopied(false)
                    setCreatedKey(res.key)
                },
            },
        )
    }

    async function handleCopy() {
        if (!createdKey) return
        await navigator.clipboard.writeText(createdKey)
        setCopied(true)
    }

    const canSubmit = name.trim().length > 0 && scopes.length > 0 && !createMutation.isPending

    return (
        <AccessPageShell
            title="API Keys"
            description="Kunci untuk layanan lain yang membaca data APIAMIS, misalnya arsgis."
            actions={(
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Kunci
                </Button>
            )}
        >
            <AccessSection title="Daftar Kunci" description="Nilai kunci tidak pernah ditampilkan lagi setelah dibuat.">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            Kunci API
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <TableSkeleton columns={6} rows={4} />
                        ) : keys.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">Belum ada kunci API</div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Awalan</TableHead>
                                            <TableHead>Scope</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Kedaluwarsa</TableHead>
                                            <TableHead>Terakhir dipakai</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {keys.map((k) => (
                                            <TableRow key={k.id}>
                                                <TableCell className="font-medium">{k.name}</TableCell>
                                                <TableCell className="font-mono text-xs">{k.prefix}…</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {k.scopes.map((s) => (
                                                            <Badge key={s} variant="outline">{s}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={STATUS_VARIANT[k.status]}>{k.status}</Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(k.expires_at)}</TableCell>
                                                <TableCell>{formatDate(k.last_used_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    {k.status === 'aktif' && (
                                                        <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(k)}>
                                                            Cabut
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </AccessSection>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat kunci API</DialogTitle>
                        <DialogDescription>Pilih data yang boleh dibaca oleh kunci ini.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="api-key-name">Nama layanan</Label>
                            <Input
                                id="api-key-name"
                                value={name}
                                maxLength={100}
                                placeholder="mis. arsgis"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <fieldset className="grid gap-2">
                            <legend className="text-sm font-medium">Scope</legend>
                            {API_KEY_SCOPES.map((s) => (
                                <label key={s.value} className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={scopes.includes(s.value)}
                                        onCheckedChange={(checked) => toggleScope(s.value, checked === true)}
                                    />
                                    {s.label}
                                </label>
                            ))}
                        </fieldset>
                        <div className="grid gap-2">
                            <Label htmlFor="api-key-expiry">Masa berlaku (hari, kosongkan untuk tanpa batas)</Label>
                            <Input
                                id="api-key-expiry"
                                type="number"
                                min={1}
                                max={3650}
                                value={expiresDays}
                                onChange={(e) => setExpiresDays(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
                        <Button onClick={handleCreate} disabled={!canSubmit}>
                            {createMutation.isPending ? 'Membuat…' : 'Buat'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={createdKey !== null} onOpenChange={(open) => !open && setCreatedKey(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Salin kunci sekarang</DialogTitle>
                        <DialogDescription>
                            Kunci ini hanya ditampilkan sekali. Setelah dialog ini ditutup, kunci tidak bisa dilihat lagi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 break-all rounded-md border bg-muted p-2 text-xs">{createdKey}</code>
                        <Button variant="outline" size="icon" onClick={() => void handleCopy()} aria-label="Salin kunci">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCreatedKey(null)}>Sudah saya simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                open={revokeTarget !== null}
                onOpenChange={(open) => !open && setRevokeTarget(null)}
                entityName="Kunci API"
                description={`Kunci "${revokeTarget?.name ?? ''}" langsung tidak berlaku. Layanan yang memakainya akan berhenti menerima data.`}
                onConfirm={() => {
                    if (revokeTarget) {
                        revokeMutation.mutate(revokeTarget.id, { onSettled: () => setRevokeTarget(null) })
                    }
                }}
                isPending={revokeMutation.isPending}
            />
        </AccessPageShell>
    )
}
