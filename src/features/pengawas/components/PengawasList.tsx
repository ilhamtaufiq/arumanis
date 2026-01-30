import { useState } from 'react';
import { usePengawas, useDeletePengawas, usePengawasStatistics } from '../api/pengawas';
import type { Pengawas } from '../types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Search as SearchIcon, RefreshCw, Users, MapPin, Wallet, FileDown } from 'lucide-react';
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
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { PengawasForm } from './PengawasForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format number to IDR currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Format currency for PDF (shorter)
const formatCurrencyShort = (value: number) => {
    if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)} M`;
    } else if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(0)} Jt`;
    }
    return new Intl.NumberFormat('id-ID').format(value);
};


export default function PengawasList() {
    const { data: pengawasData, isLoading } = usePengawas();
    const { data: statisticsData, isLoading: isLoadingStats } = usePengawasStatistics();
    const deleteMutation = useDeletePengawas();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPengawas, setSelectedPengawas] = useState<Pengawas | null>(null);
    const [open, setOpen] = useState(false);

    const filteredData = pengawasData?.data?.filter(p =>
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.jabatan?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDelete = async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Pengawas berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete pengawas:', error);
            toast.error('Gagal menghapus pengawas');
        }
    };

    const handleEdit = (pengawas: Pengawas) => {
        setSelectedPengawas(pengawas);
        setOpen(true);
    };

    const handleAdd = () => {
        setSelectedPengawas(null);
        setOpen(true);
    };

    const handleExportPDF = () => {
        if (filteredData.length === 0) {
            toast.error('Tidak ada data untuk diekspor');
            return;
        }

        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString('id-ID');

            // Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('DAFTAR PENGAWAS LAPANGAN', 105, 20, { align: 'center' });

            // Subtitle & timestamp
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Tanggal Cetak: ${timestamp}`, 105, 28, { align: 'center' });

            // Summary stats
            const totalPengawas = filteredData.length;
            const totalLokasi = filteredData.reduce((sum, p) => sum + p.jumlah_lokasi, 0);
            const totalPagu = filteredData.reduce((sum, p) => sum + p.total_pagu, 0);

            doc.setFontSize(11);
            doc.text(`Total: ${totalPengawas} Pengawas | ${totalLokasi} Lokasi | ${formatCurrency(totalPagu)}`, 105, 36, { align: 'center' });

            // Table data
            const tableData = filteredData.map((item, index) => [
                (index + 1).toString(),
                item.nama,
                item.nip || '-',
                item.jabatan || '-',
                `${item.jumlah_lokasi} Lokasi`,
                formatCurrencyShort(item.total_pagu),
            ]);

            // Generate table
            autoTable(doc, {
                startY: 42,
                head: [['No', 'Nama Pengawas', 'NIP', 'Jabatan', 'Jumlah Lokasi', 'Total Pagu']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center',
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { cellWidth: 45 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 35 },
                    4: { halign: 'center', cellWidth: 28 },
                    5: { halign: 'right', cellWidth: 30 },
                },
            });

            // Save
            const fileName = `Daftar_Pengawas_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            toast.success('PDF berhasil diunduh');
        } catch (error) {
            console.error('Failed to export PDF:', error);
            toast.error('Gagal mengekspor PDF');
        }
    };

    const stats = statisticsData?.data;

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Pengawas Lapangan</h1>
                        <p className="text-muted-foreground">
                            Kelola data pengawas dan pendamping lapangan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleExportPDF}>
                            <FileDown className="mr-2 h-4 w-4" /> Export PDF
                        </Button>
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Pengawas
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pengawas</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoadingStats ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    stats?.total_pengawas ?? 0
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pengawas & pendamping terdaftar
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Lokasi</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoadingStats ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    stats?.total_lokasi ?? 0
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Kecamatan dengan pekerjaan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pagu</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoadingStats ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    formatCurrency(stats?.total_pagu ?? 0)
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total anggaran pekerjaan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <CardTitle>Data Pengawas</CardTitle>
                            </div>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama, NIP, atau jabatan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Belum ada data pengawas.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>NIP</TableHead>
                                            <TableHead>Jabatan</TableHead>
                                            <TableHead className="text-center">Jumlah Lokasi</TableHead>
                                            <TableHead className="text-right">Total Pagu</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.nama}</TableCell>
                                                <TableCell>{item.nip || '-'}</TableCell>
                                                <TableCell>{item.jabatan || '-'}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        {item.jumlah_lokasi} Lokasi
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(item.total_pagu)}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                                                        <Pencil className="h-4 w-4" />
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
                                                                    Tindakan ini tidak dapat dibatalkan. Data pengawas akan dihapus permanen.
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
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <PengawasForm
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    selectedPengawas={selectedPengawas}
                />
            </Main>
        </>
    );
}
