import { Link } from '@tanstack/react-router';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { getDesaName, getKecamatanName } from '@/lib/wilayah-fields';
import { PekerjaanBadges } from './PekerjaanBadges';
import { PekerjaanNamaPaket } from './PekerjaanNamaPaket';
import { PekerjaanTagSelect } from './PekerjaanTagSelect';
import type { Pekerjaan, Tag } from '../types';
import type { Pengawas } from '@/features/pengawas/types';

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

interface PekerjaanMobileCardProps {
    item: Pekerjaan;
    isAdmin: boolean;
    isSelected: boolean;
    onToggleSelected: (id: number, selected: boolean) => void;
    updatingRow: number | null;
    pengawasList: Pengawas[];
    handleUpdatePengawas: (
        pekerjaanId: number,
        field: 'pengawas_id' | 'pendamping_id',
        value: number | null,
    ) => void;
    handleUpdateTags: (pekerjaanId: number, tags: Tag[]) => void;
    handleUpdateNamaPaket: (pekerjaanId: number, namaPaket: string) => void;
    onDeleteRequest: (id: number) => void;
}

/**
 * Tampilan kartu untuk layar kecil (di bawah breakpoint md),
 * menggantikan tabel desktop yang terlalu lebar untuk mobile.
 */
export function PekerjaanMobileCard({
    item,
    isAdmin,
    isSelected,
    onToggleSelected,
    updatingRow,
    pengawasList,
    handleUpdatePengawas,
    handleUpdateTags,
    handleUpdateNamaPaket,
    onDeleteRequest,
}: PekerjaanMobileCardProps) {
    const isUpdating = updatingRow === item.id;
    const subKegiatan = item.kegiatan?.nama_sub_kegiatan || '-';

    return (
        <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-start gap-3">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onToggleSelected(item.id, checked === true)}
                    aria-label={`Pilih pekerjaan ${item.nama_paket}`}
                    className="mt-1 shrink-0"
                />

                <div className="min-w-0 flex-1 space-y-1.5">
                    <PekerjaanNamaPaket
                        namaPaket={item.nama_paket || ''}
                        isAdmin={isAdmin}
                        disabled={isUpdating}
                        trigger="button"
                        wrapClassName="w-full font-medium"
                        inputClassName="w-full"
                        onSave={(value) => handleUpdateNamaPaket(item.id, value)}
                    />
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {item.kode_rekening ? <span>{item.kode_rekening}</span> : null}
                        <PekerjaanBadges item={item} />
                    </div>
                    <PekerjaanTagSelect
                        selectedTags={item.tags || []}
                        disabled={isUpdating}
                        onChange={(tags: Tag[]) => handleUpdateTags(item.id, tags)}
                    />
                </div>

                <div className="shrink-0">
                    <ListRowActions
                        edit={(
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Detail Pekerjaan">
                                <Link to="/pekerjaan/$id" params={{ id: item.id.toString() }}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        onDelete={isAdmin ? () => onDeleteRequest(item.id) : undefined}
                    />
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
                <div className="col-span-2 min-w-0">
                    <dt className="text-muted-foreground">Sub Kegiatan</dt>
                    <dd className="break-words font-medium">{subKegiatan}</dd>
                </div>
                {item.is_konsultan ? null : (
                    <>
                        <div className="min-w-0">
                            <dt className="text-muted-foreground">Kecamatan</dt>
                            <dd className="break-words font-medium">
                                {getKecamatanName(item.kecamatan) || '-'}
                            </dd>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-muted-foreground">Desa</dt>
                            <dd className="break-words font-medium">
                                {getDesaName(item.desa) || '-'}
                            </dd>
                        </div>
                    </>
                )}
                <div className="col-span-2 flex items-center justify-between gap-2 border-t pt-2">
                    <dt className="text-muted-foreground">Pagu</dt>
                    <dd className="text-sm font-semibold tabular-nums">{formatRupiah(item.pagu)}</dd>
                </div>
            </dl>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>Pengawas</span>
                    <Select
                        value={(item.pengawas_id || 0).toString()}
                        onValueChange={(val) =>
                            handleUpdatePengawas(item.id, 'pengawas_id', val === '0' ? null : parseInt(val))
                        }
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="h-9 w-full text-sm" aria-label={`Pengawas untuk ${item.nama_paket}`}>
                            <SelectValue placeholder="Pilih Pengawas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Belum Ada</SelectItem>
                            {pengawasList.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>Pendamping</span>
                    <Select
                        value={(item.pendamping_id || 0).toString()}
                        onValueChange={(val) =>
                            handleUpdatePengawas(item.id, 'pendamping_id', val === '0' ? null : parseInt(val))
                        }
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="h-9 w-full text-sm" aria-label={`Pendamping untuk ${item.nama_paket}`}>
                            <SelectValue placeholder="Pilih Pendamping" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Belum Ada</SelectItem>
                            {pengawasList.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
