import { useState, useEffect } from 'react';
import { getTiketList, deleteTiket } from '../api/tiket';
import type { Tiket, TiketStatus, TiketKategori, TiketPrioritas } from '../types';
import TicketCommentList from './TicketCommentList';
import TicketCommentForm from './TicketCommentForm';
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
    defaultTicketId?: number;
}

export default function TicketList({ pekerjaanId, isAdmin, onEdit, refreshTrigger, defaultTicketId }: TicketListProps) {
    const [tikets, setTikets] = useState<Tiket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    const selectedTicket = selectedTicketId ? tikets.find(t => t.id === selectedTicketId) : null;

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
        if (!loading && defaultTicketId && tikets.length > 0) {
            setSelectedTicketId(defaultTicketId);
        }
    }, [defaultTicketId, loading, tikets]);

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

    return (
        <div className="relative rounded-md border overflow-hidden">
            {loading && tikets.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {loading && tikets.length > 0 && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
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
                    {tikets.length === 0 && !loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <MessageSquare className="h-8 w-8 opacity-20" />
                                    <p>Belum ada tiket yang diajukan.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : tikets.length > 0 ? (
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
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="Diskusi & Detail"
                                            onClick={() => setSelectedTicketId(tiket.id)}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>

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
                    ) : null}
                </TableBody>
            </Table>

            <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
                <DialogContent className="max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    {selectedTicket && (
                        <>
                            <DialogHeader className="p-6 pb-2 border-b">
                                <div className="flex items-center justify-between gap-4">
                                    <DialogTitle className="text-xl">{selectedTicket.subjek}</DialogTitle>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(selectedTicket.status)}
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Ticket Detail Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Deskripsi</h4>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.deskripsi}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div>
                                                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Kategori</h4>
                                                {getKategoriBadge(selectedTicket.kategori)}
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Prioritas</h4>
                                                {getPrioritasBadge(selectedTicket.prioritas)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedTicket.image_url && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lampiran</h4>
                                                <div className="rounded-lg border bg-muted overflow-hidden max-w-[200px]">
                                                    <img src={selectedTicket.image_url} alt="Attachment" className="w-full h-auto cursor-zoom-in" onClick={() => window.open(selectedTicket.image_url!, '_blank')} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground block">Dibuat Pada</span>
                                                <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Pelapor</span>
                                                <span>{selectedTicket.user?.name}</span>
                                            </div>
                                            {selectedTicket.pekerjaan && (
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground block">Terkait Pekerjaan</span>
                                                    <span className="text-primary font-medium">{selectedTicket.pekerjaan.nama_paket}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Discussion Thread */}
                                <div>
                                    <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                                        <MessageSquare className="h-4 w-4" />
                                        Diskusi & Balasan
                                    </h4>
                                    <TicketCommentList comments={selectedTicket.comments || []} />
                                    <TicketCommentForm tiketId={selectedTicket.id} onSuccess={fetchTikets} />
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
