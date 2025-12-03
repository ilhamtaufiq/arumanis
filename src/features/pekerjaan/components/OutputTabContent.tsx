import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOutput, deleteOutput } from '@/features/output/api/output';
import type { Output } from '@/features/output/types';
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
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OutputTabContentProps {
    pekerjaanId: number;
}

export default function OutputTabContent({ pekerjaanId }: OutputTabContentProps) {
    const [outputList, setOutputList] = useState<Output[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOutput = async () => {
        try {
            setLoading(true);
            const response = await getOutput({ pekerjaan_id: pekerjaanId });
            setOutputList(response.data);
        } catch (error) {
            console.error('Failed to fetch output:', error);
            toast.error('Gagal memuat data output');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutput();
    }, [pekerjaanId]);

    const handleDelete = async (id: number) => {
        try {
            await deleteOutput(id);
            toast.success('Output berhasil dihapus');
            fetchOutput();
        } catch (error) {
            console.error('Failed to delete output:', error);
            toast.error('Gagal menghapus output');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (outputList.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Tidak ada data output</p>
                <Button asChild className="mt-4">
                    <Link to={`/output/new?pekerjaan_id=${pekerjaanId}`}>
                        Tambah Output
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button asChild>
                    <Link to={`/output/new?pekerjaan_id=${pekerjaanId}`}>
                        Tambah Output
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Komponen</TableHead>
                            <TableHead>Satuan</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Penerima Optional</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {outputList.map((output) => (
                            <TableRow key={output.id}>
                                <TableCell className="font-medium">{output.komponen}</TableCell>
                                <TableCell>{output.satuan}</TableCell>
                                <TableCell>{output.volume.toLocaleString('id-ID')}</TableCell>
                                <TableCell>
                                    {output.penerima_is_optional ? (
                                        <Badge variant="secondary">Ya</Badge>
                                    ) : (
                                        <Badge variant="outline">Tidak</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link to={`/output/${output.id}/edit`}>
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
                                                    <AlertDialogTitle>Hapus Output</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Apakah Anda yakin ingin menghapus output ini? Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(output.id)}>
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
        </div>
    );
}
