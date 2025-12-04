import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFotoList, deleteFoto } from '@/features/foto/api';
import type { Foto } from '@/features/foto/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Pencil, Trash2, Loader2, MapPin, CheckCircle2, AlertCircle, User, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface FotoTabContentProps {
    pekerjaanId: number;
}

export default function FotoTabContent({ pekerjaanId }: FotoTabContentProps) {
    const [fotoList, setFotoList] = useState<Foto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFoto = async () => {
        try {
            setLoading(true);
            const response = await getFotoList({ pekerjaan_id: pekerjaanId });
            setFotoList(response.data);
        } catch (error) {
            console.error('Failed to fetch foto:', error);
            toast.error('Gagal memuat data foto');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoto();
    }, [pekerjaanId]);

    const handleDelete = async (id: number) => {
        try {
            await deleteFoto(id);
            toast.success('Foto berhasil dihapus');
            fetchFoto();
        } catch (error) {
            console.error('Failed to delete foto:', error);
            toast.error('Gagal menghapus foto');
        }
    };

    const getProgressColor = (keterangan: string) => {
        switch (keterangan) {
            case '0%': return 'destructive';
            case '25%': return 'secondary';
            case '50%': return 'default';
            case '75%': return 'default';
            case '100%': return 'default';
            default: return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (fotoList.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Tidak ada foto</p>
                <Button asChild className="mt-4">
                    <Link to={`/foto/new?pekerjaan_id=${pekerjaanId}`}>
                        Tambah Foto
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button asChild>
                    <Link to={`/foto/new?pekerjaan_id=${pekerjaanId}`}>
                        Tambah Foto
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fotoList.map((foto) => (
                    <Card key={foto.id} className="overflow-hidden">
                        <div className="aspect-video relative bg-muted">
                            <img
                                src={foto.foto_url}
                                alt={`Foto ${foto.keterangan}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                            />
                            <div className="absolute top-2 right-2">
                                <Badge variant={getProgressColor(foto.keterangan)}>
                                    {foto.keterangan}
                                </Badge>
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-sm">Progres {foto.keterangan}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-xs">
                                <Layers className="h-3 w-3" />
                                {foto.komponen?.komponen || 'Tidak ada komponen'}
                            </CardDescription>
                            <CardDescription className="flex items-center gap-1 text-xs">
                                <User className="h-3 w-3" />
                                {foto.penerima?.nama || 'Tidak ada penerima'}
                            </CardDescription>
                            <CardDescription className="flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3" />
                                {foto.koordinat || 'Tidak ada koordinat'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-xs">
                                {foto.validasi_koordinat ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>Koordinat valid</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>{foto.validasi_koordinat_message || 'Koordinat tidak valid'}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link to={`/foto/${foto.id}/edit`}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Foto</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(foto.id)}>
                                            Hapus
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
