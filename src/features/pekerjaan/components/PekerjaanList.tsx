import { useEffect, useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getPekerjaan, deletePekerjaan, updatePekerjaan } from '../api/pekerjaan';
import { getTags } from '../api/tags';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import { getPengawas } from '@/features/pengawas/api/pengawas';
import api from '@/lib/api-client';
import type { Pekerjaan, Tag } from '../types';
import type { Kegiatan, KegiatanResponse } from '@/features/kegiatan/types';
import type { Kecamatan } from '@/features/kecamatan/types';
import type { Pengawas } from '@/features/pengawas/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Search as SearchIcon, RefreshCw, ChevronDown, FileUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { ImportPekerjaanDialog } from './ImportPekerjaanDialog';
import { useAuthStore } from '@/stores/auth-stores';

export default function PekerjaanList() {
    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
    const [selectedKegiatan, setSelectedKegiatan] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [tagList, setTagList] = useState<Tag[]>([]);
    const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingRow, setUpdatingRow] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { tahunAnggaran } = useAppSettingsValues();
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;

    const fetchKecamatan = async () => {
        try {
            const response = await getKecamatan();
            setKecamatanList(response.data);
        } catch (error) {
            console.error('Failed to fetch kecamatan:', error);
        }
    };

    const fetchKegiatan = async (year: string) => {
        try {
            const response = await api.get<KegiatanResponse>('/kegiatan', { params: { tahun: year, per_page: -1 } });
            setKegiatanList(response.data);
        } catch (error) {
            console.error('Failed to fetch kegiatan:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await getTags();
            setTagList(response.data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const fetchPengawas = async () => {
        try {
            const response = await getPengawas();
            setPengawasList(response.data);
        } catch (error) {
            console.error('Failed to fetch pengawas:', error);
        }
    };

    const fetchPekerjaan = useCallback(async (page: number, kecamatanId?: number, kegiatanId?: number, tagId?: number, search?: string, year?: string) => {
        try {
            setLoading(true);
            const response = await getPekerjaan({
                page,
                kecamatan_id: kecamatanId,
                kegiatan_id: kegiatanId,
                tag_id: tagId,
                search: search || undefined,
                tahun: year
            });
            console.log('Pekerjaan Data:', response.data);
            setPekerjaanList(response.data);
            setTotalPages(response.meta.last_page);
        } catch (error) {
            console.error('Failed to fetch pekerjaan:', error);
            toast.error('Gagal memuat data pekerjaan');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKecamatan();
        fetchTags();
        fetchPengawas();
    }, []);

    useEffect(() => {
        if (tahunAnggaran) {
            fetchKegiatan(tahunAnggaran);
        }
    }, [tahunAnggaran]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan);
        const kegiatanId = selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan);
        const tagId = selectedTag === 'all' ? undefined : parseInt(selectedTag);
        fetchPekerjaan(currentPage, kecamatanId, kegiatanId, tagId, debouncedSearch, tahunAnggaran);
    }, [currentPage, selectedKecamatan, selectedKegiatan, selectedTag, debouncedSearch, tahunAnggaran, fetchPekerjaan]);


    const handleDelete = async (id: number) => {
        try {
            await deletePekerjaan(id);
            toast.success('Pekerjaan berhasil dihapus');
            const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan);
            const kegiatanId = selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan);
            const tagId = selectedTag === 'all' ? undefined : parseInt(selectedTag);
            fetchPekerjaan(currentPage, kecamatanId, kegiatanId, tagId, debouncedSearch, tahunAnggaran);
        } catch (error) {
            console.error('Failed to delete pekerjaan:', error);
            toast.error('Gagal menghapus pekerjaan');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleUpdatePengawas = async (pekerjaanId: number, field: 'pengawas_id' | 'pendamping_id', value: number | null) => {
        setUpdatingRow(pekerjaanId);
        try {
            await updatePekerjaan(pekerjaanId, { [field]: value });
            // Update local state immediately
            setPekerjaanList(prev => prev.map(item => {
                if (item.id === pekerjaanId) {
                    const pengawasData = value ? pengawasList.find(p => p.id === value) : undefined;
                    return {
                        ...item,
                        [field]: value,
                        [field === 'pengawas_id' ? 'pengawas' : 'pendamping']: pengawasData
                    };
                }
                return item;
            }));
            toast.success(`${field === 'pengawas_id' ? 'Pengawas' : 'Pendamping'} berhasil diperbarui`);
        } catch (error) {
            console.error('Failed to update:', error);
            toast.error('Gagal memperbarui data');
        } finally {
            setUpdatingRow(null);
        }
    };

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header />


            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Pekerjaan</h1>
                        <p className="text-muted-foreground">
                            Kelola data pekerjaan dan paket
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Tambah <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link to="/pekerjaan/new" className="flex w-full items-center">
                                            <Plus className="mr-2 h-4 w-4" /> Tambah Manual
                                        </Link>
                                    </DropdownMenuItem>
                                    <ImportPekerjaanDialog
                                        onSuccess={() => {
                                            const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan);
                                            const kegiatanId = selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan);
                                            const tagId = selectedTag === 'all' ? undefined : parseInt(selectedTag);
                                            fetchPekerjaan(currentPage, kecamatanId, kegiatanId, tagId, debouncedSearch, tahunAnggaran);
                                        }}
                                        trigger={
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <FileUp className="mr-2 h-4 w-4" /> Import Excel
                                            </DropdownMenuItem>
                                        }
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <CardTitle>Data Pekerjaan</CardTitle>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Kecamatan:</span>
                                        <Select value={selectedKecamatan} onValueChange={(value) => {
                                            setSelectedKecamatan(value)
                                            setCurrentPage(1)
                                        }}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Semua Kecamatan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kecamatan</SelectItem>
                                                {kecamatanList.map((kec) => (
                                                    <SelectItem key={kec.id} value={kec.id.toString()}>
                                                        {kec.nama_kecamatan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Sub Kegiatan:</span>
                                        <Select value={selectedKegiatan} onValueChange={(value) => {
                                            setSelectedKegiatan(value)
                                            setCurrentPage(1)
                                        }}>
                                            <SelectTrigger className="w-[250px]">
                                                <SelectValue placeholder="Semua Sub Kegiatan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Sub Kegiatan</SelectItem>
                                                {kegiatanList.map((keg) => (
                                                    <SelectItem key={keg.id} value={keg.id.toString()}>
                                                        {keg.nama_sub_kegiatan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Tag:</span>
                                        <Select value={selectedTag} onValueChange={(value) => {
                                            setSelectedTag(value)
                                            setCurrentPage(1)
                                        }}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Semua Tag" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Tag</SelectItem>
                                                {tagList.map((tag) => (
                                                    <SelectItem key={tag.id} value={tag.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: tag.color || '#6B7280' }}
                                                            />
                                                            {tag.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama paket atau kode rekening..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : pekerjaanList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Belum ada data pekerjaan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Paket</TableHead>
                                            <TableHead>Sub Kegiatan</TableHead>
                                            <TableHead>Kecamatan</TableHead>
                                            <TableHead>Desa</TableHead>
                                            <TableHead>Pengawas</TableHead>
                                            <TableHead>Pendamping</TableHead>
                                            <TableHead>Pagu</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pekerjaanList.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div>{item.nama_paket}</div>
                                                    <div className="text-xs text-muted-foreground">{item.kode_rekening}</div>
                                                    {item.tags && item.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.tags.slice(0, 3).map(tag => (
                                                                <Badge
                                                                    key={tag.id}
                                                                    variant="outline"
                                                                    className="text-[10px] px-1.5 py-0"
                                                                    style={{
                                                                        borderColor: tag.color || undefined,
                                                                        color: tag.color || undefined
                                                                    }}
                                                                >
                                                                    {tag.name}
                                                                </Badge>
                                                            ))}
                                                            {item.tags.length > 3 && (
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                    +{item.tags.length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{item.kegiatan?.nama_sub_kegiatan || '-'}</TableCell>
                                                <TableCell>{item.kecamatan?.nama_kecamatan || '-'}</TableCell>
                                                <TableCell>{item.desa?.nama_desa || '-'}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={(item.pengawas_id || 0).toString()}
                                                        onValueChange={(val) => handleUpdatePengawas(item.id, 'pengawas_id', val === '0' ? null : parseInt(val))}
                                                        disabled={updatingRow === item.id}
                                                    >
                                                        <SelectTrigger className="w-[160px] h-8 text-xs">
                                                            <SelectValue placeholder="Pilih Pengawas" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">Tidak Ada</SelectItem>
                                                            {pengawasList.map((p) => (
                                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                                    {p.nama}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={(item.pendamping_id || 0).toString()}
                                                        onValueChange={(val) => handleUpdatePengawas(item.id, 'pendamping_id', val === '0' ? null : parseInt(val))}
                                                        disabled={updatingRow === item.id}
                                                    >
                                                        <SelectTrigger className="w-[160px] h-8 text-xs">
                                                            <SelectValue placeholder="Pilih Pendamping" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">Tidak Ada</SelectItem>
                                                            {pengawasList.map((p) => (
                                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                                    {p.nama}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>Rp {item.pagu.toLocaleString('id-ID')}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="icon" asChild>
                                                        <Link to="/pekerjaan/$id" params={{ id: item.id.toString() }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                                        </Link>
                                                    </Button>

                                                    {isAdmin && (
                                                        <>
                                                            <Button variant="outline" size="icon" asChild>
                                                                <Link to="/pekerjaan/$id/edit" params={{ id: item.id.toString() }}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="icon">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Tindakan ini tidak dapat dibatalkan. Data pekerjaan akan dihapus permanen.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                                                            Hapus
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) {
                                                    handlePageChange(currentPage - 1);
                                                }
                                            }}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {(() => {
                                        const items = [];
                                        const maxVisiblePages = 5;

                                        if (totalPages <= maxVisiblePages) {
                                            for (let i = 1; i <= totalPages; i++) {
                                                items.push(i);
                                            }
                                        } else {
                                            if (currentPage <= 3) {
                                                for (let i = 1; i <= 3; i++) items.push(i);
                                                items.push('ellipsis');
                                                items.push(totalPages);
                                            } else if (currentPage >= totalPages - 2) {
                                                items.push(1);
                                                items.push('ellipsis');
                                                for (let i = totalPages - 2; i <= totalPages; i++) items.push(i);
                                            } else {
                                                items.push(1);
                                                items.push('ellipsis');
                                                items.push(currentPage - 1);
                                                items.push(currentPage);
                                                items.push(currentPage + 1);
                                                items.push('ellipsis');
                                                items.push(totalPages);
                                            }
                                        }

                                        return items.map((item, index) => (
                                            <PaginationItem key={index}>
                                                {item === 'ellipsis' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(item as number);
                                                        }}
                                                        isActive={currentPage === item}
                                                    >
                                                        {item}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ));
                                    })()}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) {
                                                    handlePageChange(currentPage + 1);
                                                }
                                            }}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </CardFooter>
                </Card>
            </Main>
        </>
    );
}
