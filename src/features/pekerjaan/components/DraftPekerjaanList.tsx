import { useEffect, useState, useCallback } from 'react';
import { getDraftPekerjaan, deleteDraftPekerjaan, createDraftPekerjaan } from '../api/draft-pekerjaan';
import { getPenyedia } from '../api/penyedia';
import type { Pekerjaan, Penyedia } from '../types';
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
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, RefreshCw, Search as SearchIcon, FileSpreadsheet } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import api from '@/lib/api-client';

export default function DraftPekerjaanList() {
    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [penyediaList, setPenyediaList] = useState<Penyedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPekerjaan, setSelectedPekerjaan] = useState<Pekerjaan | null>(null);
    const { tahunAnggaran } = useAppSettingsValues();
    const [formData, setFormData] = useState({
        pekerjaan_id: '',
        penyedia_id: '',
        nama_pelaksana: '',
        kode_rup: '',
        kode_paket: ''
    });

    const fetchData = useCallback(async (page: number, search?: string, year?: string) => {
        try {
            setLoading(true);
            const response = await getDraftPekerjaan({ page, search, tahun: year });
            setPekerjaanList(response.data);
            setTotalPages(response.meta.last_page);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Gagal memuat data pekerjaan');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPenyediaList = async () => {
        try {
            const response = await getPenyedia({ per_page: -1 });
            setPenyediaList(response.data);
        } catch (error) {
            console.error('Failed to fetch penyedia:', error);
        }
    };

    useEffect(() => {
        fetchData(currentPage, searchQuery, tahunAnggaran);
    }, [currentPage, searchQuery, tahunAnggaran, fetchData]);

    useEffect(() => {
        if (isDialogOpen) {
            fetchPenyediaList();
        }
    }, [isDialogOpen]);

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah anda yakin ingin menghapus draft ini?')) return;
        try {
            await deleteDraftPekerjaan(id);
            toast.success('Draft berhasil dihapus');
            fetchData(currentPage, searchQuery, tahunAnggaran);
        } catch (error) {
            console.error('Failed to delete draft:', error);
            toast.error('Gagal menghapus draft');
        }
    };

    const handleOpenDialog = (pekerjaan: Pekerjaan) => {
        setSelectedPekerjaan(pekerjaan);
        setFormData({
            pekerjaan_id: pekerjaan.id.toString(),
            penyedia_id: pekerjaan.draft?.penyedia_id?.toString() || '',
            nama_pelaksana: pekerjaan.draft?.nama_pelaksana || '',
            kode_rup: pekerjaan.draft?.kode_rup || '',
            kode_paket: pekerjaan.draft?.kode_paket || ''
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            await createDraftPekerjaan(formData);
            toast.success('Draft berhasil disimpan');
            setIsDialogOpen(false);
            fetchData(currentPage, searchQuery, tahunAnggaran);
        } catch (error) {
            console.error('Failed to save draft:', error);
            toast.error('Gagal menyimpan draft');
        }
    };

    const handleExportExcel = async () => {
        try {
            const params: any = {};
            if (tahunAnggaran) params.tahun = tahunAnggaran;
            if (searchQuery) params.search = searchQuery;
            
            const response = await api.get<Blob>('/draft-pekerjaan/export/excel', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `data_draft_pekerjaan_${tahunAnggaran || 'all'}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel berhasil didownload');
        } catch (error) {
            console.error('Failed to export excel:', error);
            toast.error('Gagal export excel');
        }
    };

    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(page as number);
                                    }}
                                    isActive={currentPage === page}
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Draft Pelaksana & Penyedia</h1>
                    <p className="text-muted-foreground">
                        Kelola pelaksana dan penyedia untuk setiap paket pekerjaan
                    </p>
                </div>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto order-2 md:order-1">
                                <Button 
                                    variant="outline" 
                                    className="flex gap-2"
                                    onClick={handleExportExcel}
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Export Excel
                                </Button>
                                <div className="relative w-full md:w-96">
                                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama pekerjaan atau kode rekening..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        {loading ? (
                            <TableSkeleton columns={7} rows={10} />
                        ) : pekerjaanList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Tidak ada data pekerjaan ditemukan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table className="min-w-[1000px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[300px]">Nama Pekerjaan</TableHead>
                                            <TableHead className="min-w-[150px]">Kecamatan/Desa</TableHead>
                                            <TableHead className="min-w-[120px]">Pagu (Rp)</TableHead>
                                            <TableHead className="min-w-[120px]">RUP / Paket</TableHead>
                                            <TableHead className="min-w-[150px]">Nama Pelaksana</TableHead>
                                            <TableHead className="min-w-[150px]">Penyedia</TableHead>
                                            <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] min-w-[150px]">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pekerjaanList.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col min-w-[300px] leading-normal py-2">
                                                        <span>{p.nama_paket}</span>
                                                        <span className="text-xs text-muted-foreground">{p.kode_rekening}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {p.kecamatan?.nama_kecamatan}
                                                        <div className="text-xs text-muted-foreground">{p.desa?.nama_desa}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-semibold whitespace-nowrap">
                                                        {(p.pagu || 0).toLocaleString('id-ID')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs whitespace-nowrap">
                                                        <span>RUP: {p.draft?.kode_rup || '-'}</span>
                                                        <span>Pkt: {p.draft?.kode_paket || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="min-w-[150px] leading-normal">
                                                        {p.draft?.nama_pelaksana || (
                                                            <span className="text-muted-foreground text-xs italic">Belum diisi</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="min-w-[150px] leading-normal">
                                                        {p.draft?.penyedia?.nama || (
                                                            <span className="text-muted-foreground text-xs italic">Belum diisi</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(p)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        {p.draft ? 'Edit' : 'Isi Draft'}
                                                    </Button>
                                                    {p.draft && (
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.draft!.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
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
                    <CardFooter className="flex justify-end border-t pt-6">
                        {totalPages > 1 && renderPagination()}
                    </CardFooter>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Draft Pelaksana & Penyedia</DialogTitle>
                            <DialogDescription>
                                {selectedPekerjaan?.nama_paket}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="kode_rup">Kode RUP</Label>
                                    <Input
                                        id="kode_rup"
                                        placeholder="Kode RUP"
                                        value={formData.kode_rup}
                                        onChange={(e) => setFormData({ ...formData, kode_rup: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="kode_paket">Kode Paket</Label>
                                    <Input
                                        id="kode_paket"
                                        placeholder="Kode Paket"
                                        value={formData.kode_paket}
                                        onChange={(e) => setFormData({ ...formData, kode_paket: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama_pelaksana">Nama Pelaksana</Label>
                                <Input
                                    id="nama_pelaksana"
                                    placeholder="Masukkan nama pelaksana lapangan..."
                                    value={formData.nama_pelaksana}
                                    onChange={(e) => setFormData({ ...formData, nama_pelaksana: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="penyedia">Pilih Penyedia</Label>
                                <SearchableSelect
                                    options={penyediaList.map(p => ({ value: p.id.toString(), label: p.nama }))}
                                    value={formData.penyedia_id || ""}
                                    onValueChange={(value) => setFormData({ ...formData, penyedia_id: value })}
                                    placeholder="Cari & pilih penyedia..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleSave}>Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}
