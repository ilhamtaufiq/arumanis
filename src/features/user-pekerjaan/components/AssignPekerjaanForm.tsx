import { useState } from 'react'
import { MapPin, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/shared/SearchInput'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../lib/format'
import {
    useAssignPekerjaan,
    useAvailableUsers,
    usePekerjaanForAssignment,
} from '../hooks/useUserPekerjaan'
import { toast } from 'sonner'

type AssignPekerjaanFormProps = {
    tahunAnggaran: string
}

export function AssignPekerjaanForm({ tahunAnggaran }: AssignPekerjaanFormProps) {
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedPekerjaan, setSelectedPekerjaan] = useState<number[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    const { data: users = [], isLoading: loadingUsers } = useAvailableUsers()
    const { data: pekerjaanList = [], isLoading: loadingPekerjaan } = usePekerjaanForAssignment(
        tahunAnggaran,
        searchTerm,
    )
    const assignMutation = useAssignPekerjaan()

    const selectedUserData = users.find((user) => user.id.toString() === selectedUser)

    const togglePekerjaan = (id: number) => {
        setSelectedPekerjaan((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        )
    }

    const handleAssign = () => {
        if (!selectedUser || selectedPekerjaan.length === 0) {
            toast.error('Pilih pengawas dan minimal 1 pekerjaan')
            return
        }

        assignMutation.mutate(
            {
                user_id: parseInt(selectedUser, 10),
                pekerjaan_ids: selectedPekerjaan,
            },
            {
                onSuccess: () => {
                    setSelectedUser('')
                    setSelectedPekerjaan([])
                    setSearchTerm('')
                },
            },
        )
    }

    return (
        <Card className="border-muted/60 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Assign Pekerjaan Baru
                </CardTitle>
                <CardDescription>
                    Pilih pengawas lapangan lalu centang pekerjaan yang akan ditugaskan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Pengawas Lapangan</Label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih pengawas..." />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingUsers ? (
                                    <div className="p-2 text-sm text-muted-foreground">Memuat...</div>
                                ) : users.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">Tidak ada user tersedia</div>
                                ) : (
                                    users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>

                        {selectedUserData ? (
                            <div className="rounded-xl border bg-muted/30 p-3">
                                <p className="text-sm font-semibold">{selectedUserData.name}</p>
                                <p className="text-xs text-muted-foreground">{selectedUserData.email}</p>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label>Cari Pekerjaan</Label>
                        <SearchInput
                            defaultValue={searchTerm}
                            onSearch={setSearchTerm}
                            placeholder="Cari nama paket, kecamatan, desa..."
                            delay={300}
                        />
                        <p className="text-xs text-muted-foreground">
                            Menampilkan maks. 10 hasil. Gunakan kata kunci untuk mempersempit pencarian.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <Label className="text-sm font-semibold">Daftar Pekerjaan</Label>
                        {selectedPekerjaan.length > 0 ? (
                            <Badge variant="secondary">{selectedPekerjaan.length} dipilih</Badge>
                        ) : null}
                    </div>

                    <div className="max-h-72 overflow-y-auto rounded-xl border bg-muted/10">
                        {loadingPekerjaan ? (
                            <div className="space-y-2 p-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : pekerjaanList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
                                <MapPin className="h-8 w-8 opacity-40" />
                                Tidak ada pekerjaan ditemukan
                            </div>
                        ) : (
                            <div className="space-y-2 p-3">
                                {pekerjaanList.map((pekerjaan) => {
                                    const isSelected = selectedPekerjaan.includes(pekerjaan.id)

                                    return (
                                        <label
                                            key={pekerjaan.id}
                                            className={cn(
                                                'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all',
                                                isSelected
                                                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                                                    : 'border-transparent bg-background hover:border-muted-foreground/20 hover:bg-muted/40',
                                            )}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => togglePekerjaan(pekerjaan.id)}
                                                className="mt-0.5"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium leading-snug">{pekerjaan.nama_paket}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {pekerjaan.kecamatan?.nama || '-'} — {pekerjaan.desa?.nama || '-'}
                                                    </span>
                                                    <span className="font-medium text-foreground/80">
                                                        {formatCurrency(pekerjaan.pagu || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {selectedPekerjaan.length > 0
                            ? `${selectedPekerjaan.length} pekerjaan siap di-assign`
                            : 'Belum ada pekerjaan yang dipilih'}
                    </p>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedUser || selectedPekerjaan.length === 0 || assignMutation.isPending}
                        className="sm:min-w-44"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {assignMutation.isPending ? 'Menyimpan...' : 'Assign Pekerjaan'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}