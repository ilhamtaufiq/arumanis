import { useState, useEffect } from 'react';
import type { UsulanKegiatan } from '../types';
import { useDeleteUsulanKegiatan, useUsulanKegiatanList } from '../hooks/useUsulanKegiatan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Pencil,
    Trash2,
    Loader2,
    MessageSquare,
    FileText,
    MapPin,
    Droplet,
    Search,
    Calendar,
    Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface UsulanKegiatanListProps {
    isAdmin?: boolean;
    onEdit?: (usulan: UsulanKegiatan) => void;
    refreshTrigger?: number;
}

export default function UsulanKegiatanList({ isAdmin, onEdit, refreshTrigger }: UsulanKegiatanListProps) {
    const [selectedUsulan, setSelectedUsulan] = useState<UsulanKegiatan | null>(null);
    const [search, setSearch] = useState('');

    const { data: res, isLoading: loading, isFetching, refetch } = useUsulanKegiatanList({ search: search || undefined, per_page: 50 });
    const list = res?.data || [];
    const deleteMutation = useDeleteUsulanKegiatan();

    useEffect(() => {
        if (refreshTrigger) {
            refetch();
        }
    }, [refreshTrigger, refetch]);

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const getBidangBadge = (bidang: string) => {
        if (bidang === 'air minum') {
            return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"><Droplet className="w-3 h-3 mr-1" /> Air Minum</Badge>;
        }
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><Trash2 className="w-3 h-3 mr-1" /> Sanitasi</Badge>;
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cari usulan..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="relative rounded-md border overflow-x-auto">
                {loading && list.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {isFetching && list.length > 0 && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[140px]">Sub Bidang</TableHead>
                            <TableHead className="min-w-[200px]">Perihal</TableHead>
                            <TableHead className="min-w-[150px]">Tanggal Surat Masuk</TableHead>
                            <TableHead className="min-w-[150px]">Nomor Surat Masuk</TableHead>
                            <TableHead className="min-w-[120px]">Tanggal Surat</TableHead>
                            <TableHead className="min-w-[150px]">Pengusul</TableHead>
                            <TableHead className="min-w-[150px]">Lokasi</TableHead>
                            <TableHead className="min-w-[120px]">Tanggal</TableHead>
                            <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-8 w-8 opacity-20" />
                                        <p>Belum ada usulan kegiatan.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : list.map((item) => (
                            <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell>
                                    {getBidangBadge(item.sub_bidang)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 max-w-[250px]">
                                        <span className="font-semibold text-foreground line-clamp-2">{item.perihal}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {item.tanggal_surat_masuk ? new Date(item.tanggal_surat_masuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap max-w-[150px]">
                                    <span className="line-clamp-2">{item.nomor_surat_masuk || '-'}</span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {item.tanggal_surat ? new Date(item.tanggal_surat).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{item.nama_pengusul}</span>
                                        {isAdmin && item.user && (
                                            <span className="text-[10px] text-muted-foreground">Akun: {item.user.name}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3"/> {item.kecamatan?.nama_kecamatan}</span>
                                        <span className="ml-4">{item.desa?.nama_desa}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                    <div className="flex items-center justify-end gap-1">
                                        {item.dokumen_url && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                title="Lihat Dokumen"
                                                onClick={() => window.open(item.dokumen_url!, '_blank')}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            title="Detail Usulan"
                                            onClick={() => setSelectedUsulan(item)}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onEdit?.(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Hapus Usulan</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Apakah Anda yakin ingin menghapus usulan ini? Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Hapus
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedUsulan} onOpenChange={(open) => !open && setSelectedUsulan(null)}>
                <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    {selectedUsulan && (
                        <>
                            <DialogHeader className="p-6 pb-4 border-b">
                                <div className="flex items-center justify-between gap-4">
                                    <DialogTitle className="text-xl">{selectedUsulan.perihal}</DialogTitle>
                                    {getBidangBadge(selectedUsulan.sub_bidang)}
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <span className="text-muted-foreground block text-xs uppercase mb-1">Tanggal Surat Masuk</span>
                                        <span className="flex items-center gap-1 text-sm">
                                            <Calendar className="w-3 h-3" />
                                            {selectedUsulan.tanggal_surat_masuk ? new Date(selectedUsulan.tanggal_surat_masuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs uppercase mb-1">Nomor Surat Masuk</span>
                                        <span className="flex items-center gap-1 text-sm">
                                            <Mail className="w-3 h-3" />
                                            {selectedUsulan.nomor_surat_masuk || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs uppercase mb-1">Tanggal Surat</span>
                                        <span className="flex items-center gap-1 text-sm">
                                            <Calendar className="w-3 h-3" />
                                            {selectedUsulan.tanggal_surat ? new Date(selectedUsulan.tanggal_surat).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs uppercase mb-1">Pengusul</span>
                                        <span className="font-medium">{selectedUsulan.nama_pengusul}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs uppercase mb-1">Lokasi</span>
                                        <span className="font-medium">Kecamatan {selectedUsulan.kecamatan?.nama_kecamatan}, Desa {selectedUsulan.desa?.nama_desa}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs uppercase mb-1">Tanggal Pengajuan</span>
                                        <span>{new Date(selectedUsulan.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                {selectedUsulan.dokumen_url && (
                                    <div className="pt-4 border-t">
                                        <span className="text-muted-foreground block text-xs uppercase mb-1">Dokumen Lampiran</span>
                                        <Button variant="outline" size="sm" onClick={() => window.open(selectedUsulan.dokumen_url!, '_blank')}>
                                            <FileText className="w-4 h-4 mr-2" /> Lihat Dokumen
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
