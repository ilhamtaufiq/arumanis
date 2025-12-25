import { useState, useEffect } from 'react';
import { getTiketList, deleteTiket } from '../api/tiket';
import type { Tiket, TiketStatus, TiketKategori, TiketPrioritas } from '../types';
import { Button } from '@/components/ui/button';
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
    AlertCircle,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ImageIcon,
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
    DialogTrigger,
} from "@/components/ui/dialog";

interface TicketListProps {
    pekerjaanId?: number;
    isAdmin?: boolean;
    onEdit?: (tiket: Tiket) => void;
    refreshTrigger?: number;
}

export default function TicketList({ pekerjaanId, isAdmin, onEdit, refreshTrigger }: TicketListProps) {
    const [tikets, setTikets] = useState<Tiket[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTikets = async () => {
        try {
            setLoading(true);
            const response = await getTiketList({
                pekerjaan_id: pekerjaanId,
                per_page: 50
            });
            setTikets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            toast.error('Gagal memuat data tiket');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTikets();
    }, [pekerjaanId, refreshTrigger]);

    const handleDelete = async (id: number) => {
        try {
            await deleteTiket(id);
            toast.success('Tiket berhasil dihapus');
            fetchTikets();
        } catch (error) {
            console.error('Failed to delete ticket:', error);
            toast.error('Gagal menghapus tiket');
        }
    };

    const getStatusBadge = (status: TiketStatus) => {
        switch (status) {
            case 'open':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"><Clock className="w-3 h-3 mr-1" /> Open</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'closed':
                return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Closed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getKategoriBadge = (kategori: TiketKategori) => {
        switch (kategori) {
            case 'bug':
                return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Bug</Badge>;
            case 'request':
                return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"><MessageSquare className="w-3 h-3 mr-1" /> Request</Badge>;
            default:
                return <Badge variant="outline">Other</Badge>;
        }
    };

    const getPrioritasBadge = (prioritas: TiketPrioritas) => {
        switch (prioritas) {
            case 'high':
                return <span className="text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High</span>;
            case 'medium':
                return <span className="text-yellow-600 font-medium whitespace-nowrap">Medium</span>;
            case 'low':
                return <span className="text-green-600 font-medium whitespace-nowrap">Low</span>;
            default:
                return <span className="whitespace-nowrap">{prioritas}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead>Subjek & Deskripsi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Prioritas</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tikets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <MessageSquare className="h-8 w-8 opacity-20" />
                                    <p>Belum ada tiket yang diajukan.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        tikets.map((tiket) => (
                            <TableRow key={tiket.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {getStatusBadge(tiket.status)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 min-w-[200px]">
                                        <div className="flex items-start gap-3">
                                            {tiket.image_url && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <div className="flex-shrink-0 w-12 h-12 rounded border bg-muted flex items-center justify-center overflow-hidden cursor-zoom-in group-hover:border-primary/30 transition-colors">
                                                            <img
                                                                src={tiket.image_url}
                                                                alt="Attachment"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '';
                                                                    (e.target as HTMLImageElement).className = 'hidden';
                                                                }}
                                                            />
                                                        </div>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Lampiran: {tiket.subjek}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                                            <ImageIcon className="h-3 w-3" /> Gambar dikirim pada {new Date(tiket.created_at).toLocaleDateString()} oleh {tiket.user?.name}
                                                        </div>
                                                        <div className="rounded-lg overflow-hidden border bg-muted flex items-center justify-center max-h-[70vh]">
                                                            <img
                                                                src={tiket.image_url}
                                                                alt="Lampiran"
                                                                className="max-w-full max-h-full object-contain shadow-2xl"
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                            <div className="flex-1 flex flex-col gap-1">
                                                <span className="font-semibold text-foreground">{tiket.subjek}</span>
                                                <span className="text-xs text-muted-foreground line-clamp-2">{tiket.deskripsi}</span>
                                            </div>
                                        </div>
                                        {tiket.admin_notes && (
                                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded text-xs italic">
                                                <span className="font-bold text-yellow-800 dark:text-yellow-500">Note Admin:</span> {tiket.admin_notes}
                                            </div>
                                        )}
                                        {isAdmin && tiket.user && (
                                            <span className="text-[10px] text-muted-foreground mt-1">Oleh: {tiket.user.name}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getKategoriBadge(tiket.kategori)}
                                </TableCell>
                                <TableCell>
                                    {getPrioritasBadge(tiket.prioritas)}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(tiket.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {(isAdmin || tiket.status === 'open') && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => onEdit?.(tiket)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    disabled={!isAdmin && tiket.status !== 'open'}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Hapus Tiket</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Apakah Anda yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(tiket.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
    );
}
