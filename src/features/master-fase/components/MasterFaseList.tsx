import { useState } from 'react';
import type { MasterFasePekerjaan } from '@/features/progress/types/master-fase';
import {
    useCreateMasterFase,
    useDeleteMasterFase,
    useMasterFaseList,
    useUpdateMasterFase,
} from '@/features/progress/hooks/useMasterFase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Edit2, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const parseKeywords = (keywords: any): string[] => {
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
        try {
            const parsed = JSON.parse(keywords);
            return Array.isArray(parsed) ? parsed : [keywords];
        } catch (e) {
            return keywords ? [keywords] : [];
        }
    }
    return [];
};

export default function MasterFaseList() {
    const [filterJenis, setFilterJenis] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MasterFasePekerjaan> | null>(null);
    const [keywordsInput, setKeywordsInput] = useState('');
    
    // Delete dialog states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: phases, isLoading } = useMasterFaseList();
    const createMutation = useCreateMasterFase();
    const updateMutation = useUpdateMasterFase();
    const deleteMutation = useDeleteMasterFase();

    const filteredPhases = phases?.filter(p => {
        const matchJenis = filterJenis === 'all' || p.jenis_proyek === filterJenis;
        const matchSearch = p.nama_fase.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.kode_fase.toLowerCase().includes(searchQuery.toLowerCase());
        return matchJenis && matchSearch;
    }) || [];

    const totalPages = Math.ceil(filteredPhases.length / itemsPerPage);
    const paginatedPhases = filteredPhases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenDialog = (item?: MasterFasePekerjaan) => {
        if (item) {
            setEditingItem(item);
            setKeywordsInput(parseKeywords(item.keywords).join(', '));
        } else {
            setEditingItem({
                jenis_proyek: 'sanitasi',
                is_active: true,
                durasi_faktor: 1.0,
                overlap_persen: 0,
                prioritas: 10
            });
            setKeywordsInput('');
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!editingItem?.nama_fase || !editingItem?.kode_fase) {
            toast.error('Nama dan Kode Fase wajib diisi');
            return;
        }

        const dataToSave = {
            ...editingItem,
            keywords: keywordsInput.split(',').map(k => k.trim()).filter(k => k.length > 0)
        };

        if (editingItem.id) {
            updateMutation.mutate(
                { id: editingItem.id, data: dataToSave },
                {
                    onSuccess: () => {
                        toast.success('Master Fase berhasil diperbarui');
                        setIsDialogOpen(false);
                    },
                    onError: () => toast.error('Gagal memperbarui Master Fase'),
                },
            );
        } else {
            createMutation.mutate(dataToSave, {
                onSuccess: () => {
                    toast.success('Master Fase berhasil ditambahkan');
                    setIsDialogOpen(false);
                },
                onError: () => toast.error('Gagal menambahkan Master Fase'),
            });
        }
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Master Fase Pekerjaan</h2>
                    <p className="text-muted-foreground mt-1">
                        Kelola data fase konstruksi untuk auto-fill jadwal otomatis.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="h-4 w-4" /> Tambah Fase Baru
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-card/50">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kode atau nama fase..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="pl-9 bg-background"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
                            <Select value={filterJenis} onValueChange={(val) => { setFilterJenis(val); setCurrentPage(1); }}>
                                <SelectTrigger className="w-[180px] bg-background">
                                    <SelectValue placeholder="Semua Proyek" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Proyek</SelectItem>
                                    <SelectItem value="sanitasi">Sanitasi</SelectItem>
                                    <SelectItem value="air_minum">Air Minum (SPAM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Kode & Nama Fase</TableHead>
                                    <TableHead>Jenis Proyek</TableHead>
                                    <TableHead className="text-center">Prioritas</TableHead>
                                    <TableHead className="text-center">Durasi / Overlap</TableHead>
                                    <TableHead>Keywords (Auto-Detect)</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPhases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            Tidak ada data fase ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPhases.map((phase) => (
                                        <TableRow key={phase.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="font-medium">{phase.nama_fase}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{phase.kode_fase}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    phase.jenis_proyek === 'sanitasi' 
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }>
                                                    {phase.jenis_proyek.toUpperCase().replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-bold">
                                                {phase.prioritas}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="text-sm">{phase.durasi_faktor}x Durasi</div>
                                                {phase.overlap_persen > 0 && (
                                                    <Badge variant="secondary" className="text-[10px] mt-1">
                                                        Overlap {phase.overlap_persen}%
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {parseKeywords(phase.keywords).slice(0, 3).map((k, i) => (
                                                        <Badge key={i} variant="secondary" className="text-[10px] font-normal">{k}</Badge>
                                                    ))}
                                                    {parseKeywords(phase.keywords).length > 3 && (
                                                        <Badge variant="secondary" className="text-[10px] font-normal">+{parseKeywords(phase.keywords).length - 3}</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(phase)}>
                                                        <Edit2 className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(phase.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-end">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink 
                                                isActive={currentPage === i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className="cursor-pointer"
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem?.id ? 'Edit Fase Pekerjaan' : 'Tambah Fase Pekerjaan Baru'}</DialogTitle>
                        <DialogDescription>
                            Fase ini akan digunakan oleh sistem algoritma penjadwalan otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Kode Fase</Label>
                            <Input 
                                value={editingItem?.kode_fase || ''} 
                                onChange={e => setEditingItem({...editingItem, kode_fase: e.target.value})}
                                placeholder="Contoh: FS-01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Fase</Label>
                            <Input 
                                value={editingItem?.nama_fase || ''} 
                                onChange={e => setEditingItem({...editingItem, nama_fase: e.target.value})}
                                placeholder="Contoh: Pekerjaan Persiapan"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Jenis Proyek</Label>
                            <Select 
                                value={editingItem?.jenis_proyek || 'sanitasi'} 
                                onValueChange={(val) => setEditingItem({...editingItem, jenis_proyek: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sanitasi">Sanitasi</SelectItem>
                                    <SelectItem value="air_minum">Air Minum (SPAM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Prioritas (Urutan)</Label>
                            <Input 
                                type="number"
                                value={editingItem?.prioritas || 10} 
                                onChange={e => setEditingItem({...editingItem, prioritas: parseInt(e.target.value) || 0})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Faktor Durasi (Default: 1.0)</Label>
                            <Input 
                                type="number" step="0.1"
                                value={editingItem?.durasi_faktor || 1.0} 
                                onChange={e => setEditingItem({...editingItem, durasi_faktor: parseFloat(e.target.value) || 1.0})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Persentase Overlap (%)</Label>
                            <Input 
                                type="number" min="0" max="100"
                                value={editingItem?.overlap_persen || 0} 
                                onChange={e => setEditingItem({...editingItem, overlap_persen: parseInt(e.target.value) || 0})}
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Keywords (pisahkan dengan koma)</Label>
                            <Input 
                                value={keywordsInput} 
                                onChange={e => setKeywordsInput(e.target.value)}
                                placeholder="persiapan, pembersihan, papan nama"
                            />
                            <p className="text-xs text-muted-foreground">Sistem akan mencocokkan kata kunci ini dengan nama item di RAB untuk klasifikasi otomatis.</p>
                        </div>
                        
                        <div className="col-span-2 space-y-2">
                            <Label>Deskripsi Tambahan</Label>
                            <Input 
                                value={editingItem?.deskripsi || ''} 
                                onChange={e => setEditingItem({...editingItem, deskripsi: e.target.value})}
                                placeholder="Opsional..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Fase
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus fase pekerjaan ini? Aksi ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deletingId &&
                                deleteMutation.mutate(deletingId, {
                                    onSuccess: () => {
                                        toast.success('Master Fase berhasil dihapus');
                                        setIsDeleteDialogOpen(false);
                                    },
                                    onError: () => toast.error('Gagal menghapus Master Fase'),
                                })
                            }
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
