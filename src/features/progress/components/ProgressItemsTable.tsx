import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Info,
    LayoutGrid,
    Plus,
    Trash2,
} from 'lucide-react'
import { formatWeekRange, getWeekDateRange } from '@/features/progress/utils'
import type { ProgressReportData } from '../types'
import type {
    GroupedProgressItems,
    ProgressCalculatedData,
} from '../types/progress-editor'

type ProgressItemsTableProps = {
    viewMode: 'all' | 'single'
    onViewModeChange: (mode: 'all' | 'single') => void
    weekCount: number
    focusWeek: number
    setFocusWeek: Dispatch<SetStateAction<number>>
    report?: ProgressReportData | null
    groupedItems: GroupedProgressItems[]
    calculatedData: ProgressCalculatedData
    onAddNewRow: (groupName?: string) => void
    onRemoveGroup: (groupName: string) => void
    onUpdateGroupName: (oldName: string, newName: string) => void
    onRemoveRow: (index: number) => void
    onUpdateItem: (
        index: number,
        field: 'nama_item' | 'rincian_item' | 'satuan' | 'harga_satuan' | 'target_volume',
        value: string,
    ) => void
    onUpdateWeekly: (
        index: number,
        week: number,
        field: 'rencana' | 'realisasi',
        value: string,
    ) => void
}

export function ProgressItemsTable({
    viewMode,
    onViewModeChange,
    weekCount,
    focusWeek,
    setFocusWeek,
    report,
    groupedItems,
    calculatedData,
    onAddNewRow,
    onRemoveGroup,
    onUpdateGroupName,
    onRemoveRow,
    onUpdateItem,
    onUpdateWeekly,
}: ProgressItemsTableProps) {
    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-muted/20 p-4 rounded-2xl border border-muted-foreground/5">
                <Tabs
                    value={viewMode}
                    onValueChange={(value) => onViewModeChange(value as 'all' | 'single')}
                    className="w-auto"
                >
                    <TabsList className="bg-background shadow-inner rounded-full p-1 h-10">
                        <TabsTrigger
                            value="single"
                            className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4"
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            Fokus Minggu
                        </TabsTrigger>
                        <TabsTrigger
                            value="all"
                            className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Semua Minggu
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {viewMode === 'single' ? (
                    <div className="flex items-center gap-4 animate-in slide-in-from-right-4">
                        <Label className="text-sm font-medium">Lihat Minggu:</Label>
                        <div className="flex items-center bg-background rounded-full p-1 border shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                disabled={focusWeek <= 1}
                                onClick={() => setFocusWeek((prev) => prev - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="w-16 text-center font-bold text-primary">M{focusWeek}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                disabled={focusWeek >= weekCount}
                                onClick={() => setFocusWeek((prev) => prev + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                            {report?.kontrak?.tgl_spmk
                                ? formatWeekRange(
                                      getWeekDateRange(report.kontrak.tgl_spmk, focusWeek).start,
                                      getWeekDateRange(report.kontrak.tgl_spmk, focusWeek).end,
                                  )
                                : 'Tanggal tidak tersedia'}
                        </span>
                    </div>
                ) : null}

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onAddNewRow()}
                    className="rounded-full gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Baris Pekerjaan
                </Button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-muted-foreground/10 bg-background/50 shadow-inner">
                <div className="overflow-x-auto">
                    <Table className="min-w-max border-separate border-spacing-0">
                        <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
                            <TableRow>
                                <TableHead className="w-10 border-b border-r bg-muted/80" />
                                <TableHead className="w-12 text-center font-bold bg-muted/80 border-b border-r">
                                    No
                                </TableHead>
                                <TableHead className="font-bold bg-muted/80 border-b border-r sticky left-0 z-20">
                                    Uraian / Rincian Pekerjaan
                                </TableHead>
                                <TableHead className="w-24 text-center font-bold border-b border-r">
                                    Satuan
                                </TableHead>
                                <TableHead className="w-32 text-right font-bold border-b border-r">
                                    Harga Satuan
                                </TableHead>
                                <TableHead className="w-24 text-center font-bold border-b border-r">
                                    Bobot %
                                </TableHead>
                                <TableHead className="w-24 text-center font-bold border-b border-r">
                                    Target Vol
                                </TableHead>

                                {viewMode === 'all' ? (
                                    Array.from({ length: weekCount }).map((_, index) => (
                                        <TableHead
                                            key={index}
                                            className="p-0 border-b border-r text-center bg-blue-50/30 dark:bg-blue-950/20"
                                            colSpan={2}
                                        >
                                            <div className="px-4 py-2 border-b font-bold text-blue-600 dark:text-blue-400">
                                                Minggu {index + 1}
                                            </div>
                                            <div className="grid grid-cols-2 text-[10px] uppercase font-bold tracking-tighter">
                                                <div className="py-1 border-r bg-muted/20">Renc</div>
                                                <div className="py-1">Real</div>
                                            </div>
                                        </TableHead>
                                    ))
                                ) : (
                                    <TableHead
                                        className="p-0 border-b border-r text-center bg-blue-50/50 dark:bg-blue-950/40"
                                        colSpan={2}
                                    >
                                        <div className="px-6 py-2 border-b font-bold text-blue-700 dark:text-blue-300">
                                            Minggu {focusWeek}
                                        </div>
                                        <div className="grid grid-cols-2 text-xs uppercase font-bold tracking-tight">
                                            <div className="py-2 border-r bg-muted/30">Rencana</div>
                                            <div className="py-2">Realisasi</div>
                                        </div>
                                    </TableHead>
                                )}

                                <TableHead className="w-28 text-center font-bold border-b border-r bg-green-50/30 dark:bg-green-950/20">
                                    Total Akum
                                </TableHead>
                                <TableHead className="w-24 text-center font-bold border-b border-r">
                                    % Prog
                                </TableHead>
                                <TableHead className="w-24 text-center font-bold border-b text-primary">
                                    Bobot %
                                </TableHead>
                                <TableHead className="w-12 border-b" />
                            </TableRow>
                        </TableHeader>

                        {groupedItems.map((group, groupIndex) => (
                            <tbody key={`group-block-${groupIndex}`} className="border-b">
                                <TableRow
                                    key={`group-header-${groupIndex}`}
                                    className="bg-muted/40 hover:bg-muted/50 border-y-2 border-primary/10"
                                >
                                    <TableCell className="p-0 border-r" colSpan={3}>
                                        <div className="flex items-center sticky left-0 z-20 bg-muted/80 backdrop-blur-sm h-12 px-4 gap-3">
                                            <div className="flex items-center justify-center h-8 w-8">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onRemoveGroup(group.groupName)}
                                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold ml-2">
                                                {groupIndex + 1}
                                            </div>
                                            <Input
                                                value={
                                                    group.groupName === 'Tanpa Kategori'
                                                        ? ''
                                                        : group.groupName
                                                }
                                                onChange={(e) =>
                                                    onUpdateGroupName(group.groupName, e.target.value)
                                                }
                                                placeholder="Nama Kategori Pekerjaan (Grup)..."
                                                className="flex-1 border-b border-muted-foreground/20 focus-visible:ring-0 focus-visible:border-primary shadow-none bg-transparent font-bold text-base placeholder:text-muted-foreground/50 h-9 rounded-none px-0"
                                            />
                                            <div className="flex items-center gap-2 pr-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onAddNewRow(group.groupName)}
                                                    className="h-8 rounded-full gap-2 text-xs font-semibold hover:bg-primary/10 hover:text-primary"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Tambah Rincian
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        colSpan={
                                            viewMode === 'all'
                                                ? 5 + weekCount * 2 + 3
                                                : 5 + 2 + 3
                                        }
                                        className="bg-muted/20"
                                    />
                                </TableRow>

                                {group.items.map((item) => (
                                    <TableRow
                                        key={item.id ?? item.originalIndex}
                                        className="hover:bg-muted/20 transition-colors group"
                                    >
                                        <TableCell className="p-0 text-center border-r">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onRemoveRow(item.originalIndex)}
                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center font-medium border-r bg-muted/5 opacity-40" />
                                        <TableCell className="p-1 border-r sticky left-0 z-10 bg-background/95 group-hover:bg-muted/40 backdrop-blur-sm pl-8">
                                            <Input
                                                value={item.rincian_item}
                                                onChange={(e) =>
                                                    onUpdateItem(
                                                        item.originalIndex,
                                                        'rincian_item',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Uraian rincian pekerjaan..."
                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-sm font-medium"
                                            />
                                        </TableCell>
                                        <TableCell className="p-1 border-r">
                                            <Input
                                                value={item.satuan}
                                                onChange={(e) =>
                                                    onUpdateItem(
                                                        item.originalIndex,
                                                        'satuan',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Unit"
                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-center"
                                            />
                                        </TableCell>
                                        <TableCell className="p-1 border-r">
                                            <Input
                                                type="number"
                                                value={item.harga_satuan || ''}
                                                onChange={(e) =>
                                                    onUpdateItem(
                                                        item.originalIndex,
                                                        'harga_satuan',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-right font-mono"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center border-r font-bold text-amber-600 bg-amber-50/20">
                                            {item.bobot.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="p-1 border-r">
                                            <Input
                                                type="number"
                                                value={item.target_volume || ''}
                                                onChange={(e) =>
                                                    onUpdateItem(
                                                        item.originalIndex,
                                                        'target_volume',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-center font-mono"
                                            />
                                        </TableCell>

                                        {viewMode === 'all' ? (
                                            Array.from({ length: weekCount }).map((_, weekIndex) => {
                                                const week = weekIndex + 1
                                                return (
                                                    <TableCell
                                                        key={weekIndex}
                                                        className="p-0 border-r"
                                                        colSpan={2}
                                                    >
                                                        <div className="grid grid-cols-2 h-9 items-center">
                                                            <Input
                                                                type="number"
                                                                value={item.weekly_data[week]?.rencana ?? ''}
                                                                onChange={(e) =>
                                                                    onUpdateWeekly(
                                                                        item.originalIndex,
                                                                        week,
                                                                        'rencana',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-full border-y-0 border-l-0 border-r rounded-none focus-visible:ring-1 text-center px-1 text-[11px] bg-muted/10"
                                                            />
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    item.weekly_data[week]?.realisasi ?? ''
                                                                }
                                                                onChange={(e) =>
                                                                    onUpdateWeekly(
                                                                        item.originalIndex,
                                                                        week,
                                                                        'realisasi',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-full border-none rounded-none focus-visible:ring-1 text-center px-1 text-[11px]"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                )
                                            })
                                        ) : (
                                            <TableCell className="p-0 border-r" colSpan={2}>
                                                <div className="grid grid-cols-2 h-10 items-center">
                                                    <Input
                                                        type="number"
                                                        value={
                                                            item.weekly_data[focusWeek]?.rencana ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            onUpdateWeekly(
                                                                item.originalIndex,
                                                                focusWeek,
                                                                'rencana',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-full border-y-0 border-l-0 border-r rounded-none focus-visible:ring-1 text-center font-bold bg-blue-50/20"
                                                    />
                                                    <Input
                                                        type="number"
                                                        value={
                                                            item.weekly_data[focusWeek]?.realisasi ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            onUpdateWeekly(
                                                                item.originalIndex,
                                                                focusWeek,
                                                                'realisasi',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-full border-none rounded-none focus-visible:ring-1 text-center font-bold"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}

                                        <TableCell className="text-center border-r font-bold bg-green-50/20 text-green-700">
                                            {item.totalReal.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center border-r text-xs font-medium">
                                            {item.progressPercent.toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-primary bg-primary/5">
                                            {item.weightedProgress.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="p-0 border-l" />
                                    </TableRow>
                                ))}
                            </tbody>
                        ))}

                        <tbody key="totals-summary-body" className="bg-muted/50 font-bold border-t-2">
                            <TableRow>
                                <TableCell className="border-r" colSpan={2} />
                                <TableCell className="text-right border-r px-4 py-3">TOTAL RAB</TableCell>
                                <TableCell
                                    className="text-right border-r px-4 py-3 font-mono text-primary"
                                    colSpan={2}
                                >
                                    Rp
                                    {new Intl.NumberFormat('id-ID').format(
                                        calculatedData.totals.totalRAB,
                                    )}
                                </TableCell>
                                <TableCell className="bg-muted/20 border-r" />

                                {viewMode === 'all' ? (
                                    Array.from({ length: weekCount }).map((_, weekIndex) => {
                                        const week = weekIndex + 1
                                        return (
                                            <TableCell
                                                key={weekIndex}
                                                className="p-0 border-r text-[10px]"
                                                colSpan={2}
                                            >
                                                <div className="grid grid-cols-2 text-center h-full items-center">
                                                    <div className="py-2 border-r bg-muted/20 opacity-60">
                                                        {calculatedData.totals.weekly[week].rencana.toFixed(1)}
                                                    </div>
                                                    <div className="py-2 text-blue-600">
                                                        {calculatedData.totals.weekly[week].realisasi.toFixed(
                                                            1,
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        )
                                    })
                                ) : (
                                    <TableCell className="p-0 border-r" colSpan={2}>
                                        <div className="grid grid-cols-2 text-center h-full items-center">
                                            <div className="py-3 border-r bg-muted/20 text-muted-foreground">
                                                {calculatedData.totals.weekly[focusWeek].rencana.toFixed(2)}
                                            </div>
                                            <div className="py-3 text-blue-700">
                                                {calculatedData.totals.weekly[focusWeek].realisasi.toFixed(2)}
                                            </div>
                                        </div>
                                    </TableCell>
                                )}

                                <TableCell className="text-center border-r bg-muted/30">SUM</TableCell>
                                <TableCell className="text-center border-r bg-primary/5 text-primary font-bold">
                                    {calculatedData.totals.totalWeightedProgress.toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-center bg-muted/30 font-bold">100%</TableCell>
                                <TableCell />
                            </TableRow>
                        </tbody>
                    </Table>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/10 px-4 py-2 rounded-lg border border-dashed">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <Info className="h-3 w-3" /> Bobot dihitung otomatis berdasarkan Harga Satuan ×
                        Target Volume + PPN 11%
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Info className="h-3 w-3" /> Gunakan mode &quot;Fokus Minggu&quot; untuk input
                        yang lebih cepat
                    </span>
                </div>
                <div className="flex items-center gap-3 font-medium">
                    <Badge variant="outline" className="text-[10px] bg-background">
                        ESC untuk batalkan
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-background">
                        ENTER untuk baris baru
                    </Badge>
                </div>
            </div>
        </>
    )
}