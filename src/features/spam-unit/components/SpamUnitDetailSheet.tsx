import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getSpamUnit } from '../api'
import type { UnitSpam } from '../types'

type DetailTab = 'info' | 'pokmas' | 'achievements' | 'budgets'

interface SpamUnitDetailSheetProps {
    unitId: number | null
    open: boolean
    onOpenChange: (open: boolean) => void
    initialTab?: DetailTab
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

function InfoBlock({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="rounded-lg bg-slate-50/80 p-3 dark:bg-slate-900/50">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm font-semibold">{value || '-'}</p>
        </div>
    )
}

export function SpamUnitDetailSheet({
    unitId,
    open,
    onOpenChange,
    initialTab = 'info',
}: SpamUnitDetailSheetProps) {
    const [activeTab, setActiveTab] = useState<DetailTab>(initialTab)

    useEffect(() => {
        if (open) setActiveTab(initialTab)
    }, [open, initialTab, unitId])

    const { data, isLoading } = useQuery({
        queryKey: ['spam-unit-detail', unitId],
        queryFn: () => getSpamUnit(unitId!),
        enabled: open && !!unitId,
    })

    const unit = data?.data as UnitSpam | undefined

    const tabs: { id: DetailTab; label: string }[] = [
        { id: 'info', label: 'Unit SPAM' },
        { id: 'pokmas', label: 'POKMAS' },
        { id: 'achievements', label: 'Capaian' },
        { id: 'budgets', label: 'Anggaran' },
    ]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>{unit?.name || (unit ? `Unit #${unit.id}` : 'Detail Unit SPAM')}</SheetTitle>
                    <SheetDescription>
                        {unit?.desa?.kecamatan?.n_kec || unit?.desa?.kecamatan?.nama_kecamatan}
                        {' · '}
                        Desa {unit?.desa?.n_desa || unit?.desa?.nama_desa}
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : unit ? (
                    <div className="space-y-4 px-1 pb-6">
                        <div className="flex flex-wrap gap-2">
                            {unit.is_simspam ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600">SIMSPAM</Badge>
                            ) : (
                                <Badge variant="secondary">Standar</Badge>
                            )}
                            {unit.desa?.target != null && (
                                <Badge variant="outline">Target desa {unit.desa.target.toLocaleString('id-ID')} KK</Badge>
                            )}
                            {(unit.desa?.bjp_master ?? 0) > 0 && (
                                <Badge variant="outline">
                                    BJP master {unit.desa.bjp_master?.toLocaleString('id-ID')} KK
                                </Badge>
                            )}
                        </div>

                        <div className="flex border-b">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 border-b-2 py-2.5 text-center text-xs font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'info' && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoBlock label="Sistem Layanan" value={unit.sistem_layanan} />
                                <InfoBlock label="Kapasitas Mata Air" value={unit.sumber_mata_air_kap} />
                                <InfoBlock label="Kapasitas Air Tanah" value={unit.sumber_air_tanah_kap} />
                                <InfoBlock label="Sumber Lain" value={unit.lain_lain_kap} />
                            </div>
                        )}

                        {activeTab === 'pokmas' && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 rounded-xl border bg-slate-50/50 p-4 dark:bg-slate-900/50">
                                    <Building2 className="mt-0.5 h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nama POKMAS</p>
                                        <p className="text-base font-bold">
                                            {unit.pengelola?.pokmas || '(Belum terbentuk)'}
                                        </p>
                                        <p className="mt-1 text-xs text-emerald-600">
                                            Perdes: {unit.pengelola?.perdes || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <InfoBlock label="Ketua / Kepala" value={unit.pengelola?.kepala} />
                                    <InfoBlock label="Bendahara" value={unit.pengelola?.bendahara} />
                                    <InfoBlock label="Sekretaris" value={unit.pengelola?.sekretaris} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="space-y-3">
                                {unit.achievements && unit.achievements.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tahun</TableHead>
                                                    <TableHead className="text-center">SR</TableHead>
                                                    <TableHead className="text-center">KK</TableHead>
                                                    <TableHead className="text-center">Jiwa</TableHead>
                                                    <TableHead className="text-center">BJP KK</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {unit.achievements.map((ach) => (
                                                    <TableRow key={ach.id}>
                                                        <TableCell className="font-medium">{ach.tahun}</TableCell>
                                                        <TableCell className="text-center">
                                                            {ach.jumlah_sr.toLocaleString('id-ID')}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {ach.jumlah_kk.toLocaleString('id-ID')}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {ach.jumlah_jiwa.toLocaleString('id-ID')}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {ach.jumlah_bjp_kk.toLocaleString('id-ID')}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada histori capaian untuk unit ini.
                                    </p>
                                )}
                                {unit.achievements?.some((a) => a.catatan) && (
                                    <p className="text-xs text-muted-foreground">
                                        Catatan integrasi ditandai pada baris capaian tahun terkait.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === 'budgets' && (
                            <div className="space-y-3">
                                {unit.budgets && unit.budgets.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tahun</TableHead>
                                                    <TableHead>Paket</TableHead>
                                                    <TableHead className="text-center">Sumber</TableHead>
                                                    <TableHead className="text-right">Nilai</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {unit.budgets.map((bg) => (
                                                    <TableRow key={bg.id}>
                                                        <TableCell>{bg.tahun}</TableCell>
                                                        <TableCell className="max-w-[140px] truncate text-xs">
                                                            {bg.nama_paket || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-center text-xs">
                                                            {bg.sumber_dana || 'APBD'}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs font-semibold text-emerald-600">
                                                            {formatCurrency(Number(bg.nilai_kontrak || 0))}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada data anggaran tercatat.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            Edit data unit & input capaian baru ada di tab Master Unit SPAM.
                        </div>
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">Unit tidak ditemukan.</p>
                )}
            </SheetContent>
        </Sheet>
    )
}