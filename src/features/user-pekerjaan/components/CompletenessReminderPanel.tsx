import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BellRing, Camera, ClipboardList, Loader2, Users } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { CompletenessGapType } from '../api/user-pekerjaan'
import {
    useBroadcastCompletenessReminders,
    useCompletenessGaps,
} from '../hooks/useUserPekerjaan'
import { GAP_BADGE_VARIANT, GAP_OPTIONS, getGapLabel } from '../lib/completeness'

type CompletenessReminderPanelProps = {
    tahunAnggaran: string
}

const DEFAULT_GAPS: CompletenessGapType[] = ['foto', 'penerima', 'progress']

export function CompletenessReminderPanel({ tahunAnggaran }: CompletenessReminderPanelProps) {
    const [selectedGaps, setSelectedGaps] = useState<CompletenessGapType[]>(DEFAULT_GAPS)
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
    const [messagePrefix, setMessagePrefix] = useState('')

    const gapParams = useMemo(
        () => ({
            gaps: selectedGaps,
            tahun: tahunAnggaran || undefined,
        }),
        [selectedGaps, tahunAnggaran],
    )

    const { data, isLoading, isFetching } = useCompletenessGaps(gapParams)
    const broadcastMutation = useBroadcastCompletenessReminders()

    const users = data?.users ?? []
    const summary = data?.summary

    useEffect(() => {
        setSelectedUserIds(users.map((user) => user.user_id))
    }, [users])

    const toggleGap = (gap: CompletenessGapType, checked: boolean) => {
        setSelectedGaps((current) => {
            if (checked) {
                return current.includes(gap) ? current : [...current, gap]
            }
            const next = current.filter((value) => value !== gap)
            return next.length > 0 ? next : current
        })
    }

    const toggleUser = (userId: number, checked: boolean) => {
        setSelectedUserIds((current) =>
            checked ? [...new Set([...current, userId])] : current.filter((id) => id !== userId),
        )
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedUserIds(checked ? users.map((user) => user.user_id) : [])
    }

    const handleBroadcast = async () => {
        if (selectedUserIds.length === 0) {
            return
        }

        await broadcastMutation.mutateAsync({
            gaps: selectedGaps,
            tahun: tahunAnggaran || undefined,
            user_ids: selectedUserIds,
            message_prefix: messagePrefix.trim() || undefined,
            notification_type: 'warning',
        })
    }

    const allSelected = users.length > 0 && selectedUserIds.length === users.length

    return (
        <Card className="border-amber-500/20 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BellRing className="h-5 w-5 text-amber-600" />
                    Broadcast Pengingat Kelengkapan
                </CardTitle>
                <CardDescription>
                    Kirim notifikasi ke pengawas yang belum melengkapi progress, foto, atau penerima
                    pada pekerjaan yang ditugaskan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Jenis data yang dicek</Label>
                    <div className="flex flex-wrap gap-4">
                        {GAP_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                            >
                                <Checkbox
                                    checked={selectedGaps.includes(option.value)}
                                    onCheckedChange={(checked) =>
                                        toggleGap(option.value, checked === true)
                                    }
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center">
                        <ClipboardList className="h-9 w-9 text-muted-foreground/50" />
                        <p className="font-medium">Semua pengawas sudah lengkap</p>
                        <p className="max-w-md text-sm text-muted-foreground">
                            Tidak ada pekerjaan ter-assign yang kekurangan data untuk filter yang
                            dipilih.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    Pengawas
                                </div>
                                <p className="text-2xl font-bold">{summary?.total_users ?? 0}</p>
                            </div>
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Pekerjaan
                                </div>
                                <p className="text-2xl font-bold">
                                    {summary?.total_pekerjaan_with_gaps ?? 0}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Camera className="h-3.5 w-3.5" />
                                    Ringkasan gap
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {GAP_OPTIONS.filter((option) =>
                                        selectedGaps.includes(option.value),
                                    ).map((option) => (
                                        <Badge key={option.value} variant="outline" className="text-xs">
                                            {option.label}: {summary?.by_gap?.[option.value] ?? 0}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <Label className="text-sm font-medium">Pilih penerima pengingat</Label>
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                    />
                                    Pilih semua
                                </label>
                            </div>

                            <ScrollArea className="h-72 rounded-xl border bg-background">
                                <div className="divide-y">
                                    {users.map((user) => (
                                        <div key={user.user_id} className="flex gap-3 p-4">
                                            <Checkbox
                                                className="mt-1"
                                                checked={selectedUserIds.includes(user.user_id)}
                                                onCheckedChange={(checked) =>
                                                    toggleUser(user.user_id, checked === true)
                                                }
                                            />
                                            <div className="min-w-0 flex-1 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <UserAvatar
                                                        className="h-10 w-10"
                                                        name={user.user_name}
                                                        email={user.user_email}
                                                        id={user.user_id}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-medium">{user.user_name}</p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {user.user_email}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {user.pekerjaan.length} pekerjaan belum lengkap
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {user.pekerjaan.map((pekerjaan) => (
                                                        <div
                                                            key={pekerjaan.pekerjaan_id}
                                                            className="rounded-lg border bg-muted/10 px-3 py-2"
                                                        >
                                                            <p className="truncate text-sm font-medium">
                                                                {pekerjaan.nama_paket}
                                                            </p>
                                                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                                {pekerjaan.gaps.map((gap) => (
                                                                    <Badge
                                                                        key={gap}
                                                                        variant={GAP_BADGE_VARIANT[gap]}
                                                                        className="text-[10px]"
                                                                    >
                                                                        {getGapLabel(gap)}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {pekerjaan.gaps
                                                                    .map(
                                                                        (gap) =>
                                                                            pekerjaan.gap_details[gap],
                                                                    )
                                                                    .filter(Boolean)
                                                                    .join(' · ')}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reminder-prefix">Pesan pembuka (opsional)</Label>
                            <Textarea
                                id="reminder-prefix"
                                placeholder="Contoh: Mohon segera lengkapi data pekerjaan berikut sebelum akhir minggu ini."
                                value={messagePrefix}
                                onChange={(event) => setMessagePrefix(event.target.value)}
                                className="min-h-[80px] resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Daftar pekerjaan dan jenis kekurangan akan ditambahkan otomatis di
                                pesan notifikasi.
                            </p>
                        </div>

                        <Button
                            className="h-11 w-full"
                            onClick={handleBroadcast}
                            disabled={
                                broadcastMutation.isPending ||
                                selectedUserIds.length === 0 ||
                                isFetching
                            }
                        >
                            {broadcastMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mengirim pengingat...
                                </>
                            ) : (
                                <>
                                    <BellRing className="mr-2 h-4 w-4" />
                                    Kirim ke {selectedUserIds.length} pengawas
                                </>
                            )}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    )
}