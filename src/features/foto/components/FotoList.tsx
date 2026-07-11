import { useState, useEffect, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import type { Foto } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Pencil, Plus, ChevronDown, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from '@/components/shared/SearchInput';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { useDeleteFoto, useFotoList } from '../hooks/useFoto';

interface PekerjaanGroup {
    pekerjaan_id: number;
    nama_paket: string;
    fotos: Foto[];
}

export default function FotoList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [previewFoto, setPreviewFoto] = useState<Foto | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
    const { tahunAnggaran } = useAppSettingsValues();

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const { data, isLoading, isError } = useFotoList({
        page,
        search,
        tahun: tahunAnggaran,
    });
    const deleteMutation = useDeleteFoto();

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data foto');
        }
    }, [isError]);

    // Group photos by pekerjaan
    const groupedByPekerjaan = useMemo(() => {
        if (!data?.data) return [];

        const groups: Map<number, PekerjaanGroup> = new Map();

        data.data.forEach((foto) => {
            const pekerjaanId = foto.pekerjaan_id || 0;
            const namaPaket = foto.pekerjaan?.nama_paket || 'Tidak ada pekerjaan';

            if (!groups.has(pekerjaanId)) {
                groups.set(pekerjaanId, {
                    pekerjaan_id: pekerjaanId,
                    nama_paket: namaPaket,
                    fotos: []
                });
            }

            groups.get(pekerjaanId)!.fotos.push(foto);
        });

        return Array.from(groups.values());
    }, [data?.data]);

    // Auto-expand all groups when data loads
    useEffect(() => {
        if (groupedByPekerjaan.length > 0) {
            setExpandedGroups(new Set(groupedByPekerjaan.map(g => g.pekerjaan_id)));
        }
    }, [groupedByPekerjaan]);

    const toggleGroup = (pekerjaanId: number) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(pekerjaanId)) {
                next.delete(pekerjaanId);
            } else {
                next.add(pekerjaanId);
            }
            return next;
        });
    };

    return (
        <>
            <ListPageLayout
                shell
                title="Dokumentasi Foto"
                description="Kelola dokumentasi foto pekerjaan"
                cardTitle="Data Foto"
                action={(
                    <Button asChild>
                        <Link to="/foto/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Foto
                        </Link>
                    </Button>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={search}
                        onSearch={handleSearch}
                        placeholder="Cari..."
                        className="w-full sm:max-w-sm"
                        delay={300}
                    />
                )}
                footer={(
                    <ListPagination
                        page={page}
                        totalPages={data?.meta?.last_page || 1}
                        onPageChange={setPage}
                        disabled={isLoading}
                        variant="simple"
                        hasNextPage={!!data?.links?.next}
                    />
                )}
            >
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="rounded-md border p-10 text-center text-muted-foreground">
                            Memuat data...
                        </div>
                    ) : groupedByPekerjaan.length === 0 ? (
                        <div className="rounded-md border p-10 text-center">
                            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Tidak ada data foto</p>
                        </div>
                    ) : (
                        groupedByPekerjaan.map((group) => (
                            <Collapsible
                                key={group.pekerjaan_id}
                                open={expandedGroups.has(group.pekerjaan_id)}
                                onOpenChange={() => toggleGroup(group.pekerjaan_id)}
                            >
                                <div className="rounded-lg border">
                                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <ChevronDown
                                                className={`h-5 w-5 text-muted-foreground transition-transform ${expandedGroups.has(group.pekerjaan_id) ? 'rotate-0' : '-rotate-90'
                                                    }`}
                                            />
                                            <div className="text-left">
                                                <h3 className="font-semibold">{group.nama_paket}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {group.fotos.length} foto
                                                </p>
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="border-t">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[100px]">Preview</TableHead>
                                                        <TableHead>Progress</TableHead>
                                                        <TableHead>Koordinat</TableHead>
                                                        <TableHead className="w-[100px]">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.fotos.map((foto) => (
                                                        <TableRow key={foto.id}>
                                                            <TableCell>
                                                                <button
                                                                    onClick={() => setPreviewFoto(foto)}
                                                                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                                                                >
                                                                    <img
                                                                        src={foto.foto_thumb_url || foto.foto_url}
                                                                        alt="Preview"
                                                                        loading="lazy"
                                                                        className="h-16 w-16 object-cover rounded-md hover:scale-105 transition-transform"
                                                                    />
                                                                </button>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary text-primary-foreground">
                                                                    {foto.keterangan}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <MapPin className="mr-1 h-3 w-3" />
                                                                    {foto.koordinat}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <ListRowActions
                                                                    edit={(
                                                                        <Button variant="ghost" size="icon" asChild>
                                                                            <Link to="/foto/$id/edit" params={{ id: foto.id.toString() }}>
                                                                                <Pencil className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    )}
                                                                    onDelete={() => setDeleteId(foto.id)}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        ))
                    )}
                </div>
            </ListPageLayout>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Foto"
                description="Tindakan ini tidak dapat dibatalkan. Foto akan dihapus secara permanen."
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) })}
                isPending={deleteMutation.isPending}
            />

            <ImagePreviewModal
                open={!!previewFoto}
                onOpenChange={(open) => !open && setPreviewFoto(null)}
                imageUrl={previewFoto?.foto_url ?? ''}
                title={previewFoto?.pekerjaan?.nama_paket || 'Preview Foto'}
                badge={previewFoto?.keterangan}
                coordinate={previewFoto?.koordinat}
            />
        </>
    );
}