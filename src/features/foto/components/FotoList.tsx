import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { getFotoList, deleteFoto } from '../api';
import type { Foto, FotoResponse } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Edit, Trash2, Plus, Search as SearchIcon, MapPin, X, ExternalLink, ChevronDown, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

interface PekerjaanGroup {
    pekerjaan_id: number;
    nama_paket: string;
    fotos: Foto[];
}

export default function FotoList() {
    const [data, setData] = useState<FotoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [previewFoto, setPreviewFoto] = useState<Foto | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getFotoList({
                page,
                search,
                tahun: tahunAnggaran
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch foto:', error);
            toast.error('Gagal memuat data foto');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, tahunAnggaran]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchData]);

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

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteFoto(deleteId);
                toast.success('Foto berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete foto:', error);
                toast.error('Gagal menghapus foto');
            } finally {
                setDeleteId(null);
            }
        }
    };

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                </div>
            </Header>

            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dokumentasi Foto</h1>
                        <p className="text-muted-foreground">
                            Kelola dokumentasi foto pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild>
                            <Link to="/foto/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Foto
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Grouped Photo Display */}
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
                                                                        src={foto.foto_url}
                                                                        alt="Preview"
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
                                                                <div className="flex items-center space-x-2">
                                                                    <Button variant="ghost" size="icon" asChild>
                                                                        <Link to="/foto/$id/edit" params={{ id: foto.id.toString() }}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => setDeleteId(foto.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
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

                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!data?.links?.next || isLoading}
                    >
                        Next
                    </Button>
                </div>

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Foto akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Photo Preview Dialog */}
                <Dialog open={!!previewFoto} onOpenChange={(open) => !open && setPreviewFoto(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="flex items-center justify-between">
                                <span className="truncate pr-4">
                                    {previewFoto?.pekerjaan?.nama_paket || 'Preview Foto'}
                                </span>
                            </DialogTitle>
                        </DialogHeader>
                        {previewFoto && (
                            <div className="flex flex-col">
                                {/* Image Container */}
                                <div className="relative flex items-center justify-center bg-black/5 dark:bg-black/20 min-h-[300px] max-h-[60vh]">
                                    <img
                                        src={previewFoto.foto_url}
                                        alt="Preview"
                                        className="max-w-full max-h-[60vh] object-contain"
                                    />
                                </div>
                                {/* Info Footer */}
                                <div className="p-4 border-t bg-muted/30 space-y-2">
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Progress:</span>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                                                {previewFoto.keterangan}
                                            </span>
                                        </div>
                                        {previewFoto.koordinat && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span className="font-mono text-xs">{previewFoto.koordinat}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(previewFoto.foto_url, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Buka di Tab Baru
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setPreviewFoto(null)}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Tutup
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}
