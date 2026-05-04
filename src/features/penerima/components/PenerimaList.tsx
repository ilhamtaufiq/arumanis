import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import { getPenerimaList } from '../api';
import type { Pekerjaan, PekerjaanResponse } from '@/features/pekerjaan/types';
import type { Penerima } from '../types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    SearchIcon, 
    RefreshCw, 
    Users, 
    Home,
    MapPin,
    ExternalLink,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

export default function PenerimaList() {
    const [pekerjaanData, setPekerjaanData] = useState<PekerjaanResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedPekerjaan, setSelectedPekerjaan] = useState<Pekerjaan | null>(null);
    const [penerimaList, setPenerimaList] = useState<Penerima[]>([]);
    const [isLoadingPenerima, setIsLoadingPenerima] = useState(false);
    
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchPekerjaan = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getPekerjaan({
                page,
                search,
                tahun: tahunAnggaran,
                per_page: 20,
                sort_by: sortBy,
                sort_direction: sortDirection
            });
            setPekerjaanData(response);
        } catch (error) {
            console.error('Failed to fetch pekerjaan:', error);
            toast.error('Gagal memuat data pekerjaan');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, tahunAnggaran, sortBy, sortDirection]);

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
        setPage(1); // Reset to first page when sorting
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4 text-primary" /> : <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPekerjaan();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchPekerjaan]);

    const handleViewPenerima = async (pekerjaan: Pekerjaan) => {
        setSelectedPekerjaan(pekerjaan);
        setIsLoadingPenerima(true);
        try {
            const response = await getPenerimaList({
                pekerjaan_id: pekerjaan.id,
                per_page: -1 // Assume we want all for the modal
            });
            setPenerimaList(response.data);
        } catch (error) {
            console.error('Failed to fetch beneficiaries:', error);
            toast.error('Gagal memuat data penerima');
        } finally {
            setIsLoadingPenerima(false);
        }
    };

    return (
        <>
            <Header />

            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Penerima Manfaat</h1>
                        <p className="text-muted-foreground">
                            Data penerima manfaat berdasarkan paket pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline">
                            <Link to="/penerima/new">
                                <Users className="mr-2 h-4 w-4" />
                                Input Penerima Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari paket pekerjaan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {tahunAnggaran && (
                            <Badge variant="secondary" className="h-10 px-4 flex items-center gap-2 text-sm font-normal">
                                Tahun: {tahunAnggaran}
                            </Badge>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5" />
                                Paket Pekerjaan & Penerima
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {pekerjaanData?.meta?.total || 0} paket
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : pekerjaanData?.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Home className="h-12 w-12 mx-auto opacity-20 mb-2" />
                                <p>Tidak ada data pekerjaan untuk tahun {tahunAnggaran}.</p>
                                <p className="text-sm">Mungkin data ada di tahun anggaran lain (2024/2025).</p>
                                <div className="mt-4 flex justify-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            // This is a hacky way to "clear" the global filter for this view only
                                            // by overriding the fetch without passing the year
                                            (async () => {
                                                setIsLoading(true);
                                                try {
                                                    const response = await getPekerjaan({
                                                        page: 1,
                                                        search: '',
                                                        per_page: 20
                                                    });
                                                    setPekerjaanData(response);
                                                } catch (e) {
                                                    toast.error('Gagal memuat data semua tahun');
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            })();
                                        }}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Lihat Semua Tahun
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead 
                                                className="min-w-[300px] cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort('nama_paket')}
                                            >
                                                <div className="flex items-center">
                                                    Paket Pekerjaan
                                                    {getSortIcon('nama_paket')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="min-w-[150px]">Lokasi</TableHead>
                                            <TableHead 
                                                className="min-w-[120px] text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleSort('penerima_count')}
                                            >
                                                <div className="flex items-center justify-center">
                                                    Total Penerima
                                                    {getSortIcon('penerima_count')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pekerjaanData?.data.map((pekerjaan) => (
                                            <TableRow key={pekerjaan.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-foreground">{pekerjaan.nama_paket}</span>
                                                        <span className="text-xs text-muted-foreground">{pekerjaan.kode_rekening}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{pekerjaan.kecamatan?.nama_kecamatan}</span>
                                                        </div>
                                                        <span className="ml-4 text-muted-foreground">{pekerjaan.desa?.nama_desa}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button 
                                                        variant="ghost" 
                                                        className="hover:bg-primary/10 hover:text-primary gap-2"
                                                        onClick={() => handleViewPenerima(pekerjaan)}
                                                    >
                                                        <Users className="h-4 w-4" />
                                                        <span className="font-bold">{pekerjaan.penerima_count || 0}</span>
                                                        <span className="text-xs">Jiwa/KK</span>
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link to="/pekerjaan/$id" params={{ id: pekerjaan.id.toString() }}>
                                                            <ExternalLink className="h-4 w-4 mr-1" />
                                                            Detail
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
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
                        disabled={!pekerjaanData?.links?.next || isLoading}
                    >
                        Next
                    </Button>
                </div>

                {/* Modal Detail Penerima */}
                <Dialog open={!!selectedPekerjaan} onOpenChange={(open) => !open && setSelectedPekerjaan(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Daftar Penerima Manfaat
                            </DialogTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                                <p className="font-semibold text-foreground">{selectedPekerjaan?.nama_paket}</p>
                                <p>{selectedPekerjaan?.kecamatan?.nama_kecamatan}, {selectedPekerjaan?.desa?.nama_desa}</p>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto mt-4">
                            {isLoadingPenerima ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : penerimaList.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Users className="h-12 w-12 mx-auto opacity-20 mb-2" />
                                    <p>Belum ada data penerima untuk paket ini.</p>
                                    <Button asChild variant="link" className="mt-2">
                                        <Link to="/penerima/new">Input Data Sekarang</Link>
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Penerima</TableHead>
                                            <TableHead>NIK</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead className="text-center">Jml Jiwa</TableHead>
                                            <TableHead>Tipe</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {penerimaList.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.nama}</TableCell>
                                                <TableCell className="text-xs font-mono">{p.nik || '-'}</TableCell>
                                                <TableCell className="text-xs">{p.alamat || '-'}</TableCell>
                                                <TableCell className="text-center font-bold">{p.jumlah_jiwa}</TableCell>
                                                <TableCell>
                                                    {p.is_komunal ? (
                                                        <Badge variant="secondary">Komunal</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Individu</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}
