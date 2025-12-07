import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getBerkasList, deleteBerkas } from '@/features/berkas/api';
import type { Berkas } from '@/features/berkas/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Pencil, Trash2, Loader2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import EmbeddedBerkasForm from './EmbeddedBerkasForm';

interface BerkasTabContentProps {
    pekerjaanId: number;
}

export default function BerkasTabContent({ pekerjaanId }: BerkasTabContentProps) {
    const [berkasList, setBerkasList] = useState<Berkas[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBerkas = async () => {
        try {
            setLoading(true);
            const response = await getBerkasList({ pekerjaan_id: pekerjaanId });
            setBerkasList(response.data);
        } catch (error) {
            console.error('Failed to fetch berkas:', error);
            toast.error('Gagal memuat data berkas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBerkas();
    }, [pekerjaanId]);

    const handleDelete = async (id: number) => {
        try {
            await deleteBerkas(id);
            toast.success('Berkas berhasil dihapus');
            fetchBerkas();
        } catch (error) {
            console.error('Failed to delete berkas:', error);
            toast.error('Gagal menghapus berkas');
        }
    };

    const handleDownload = (url: string, jenisDokumen: string) => {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = jenisDokumen;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Form Upload Berkas */}
            <EmbeddedBerkasForm pekerjaanId={pekerjaanId} onSuccess={fetchBerkas} />

            {/* Tabel Berkas */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Jenis Dokumen</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead>Tanggal Upload</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {berkasList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Tidak ada berkas. Gunakan form di atas untuk upload berkas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            berkasList.map((berkas) => (
                                <TableRow key={berkas.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {berkas.jenis_dokumen}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={berkas.berkas_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            Lihat File
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(berkas.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(berkas.berkas_url, berkas.jenis_dokumen)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/berkas/$id/edit" params={{ id: berkas.id.toString() }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Hapus Berkas</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Apakah Anda yakin ingin menghapus berkas ini? Tindakan ini tidak dapat dibatalkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(berkas.id)}>
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
