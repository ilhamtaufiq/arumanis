import { useState } from 'react';
import { useUploadQueue } from '@/stores/upload-queue-store';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, CloudOff, RefreshCw, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createFoto } from '@/features/foto/api';
import { toast } from 'sonner';

export default function UploadQueueManager() {
    const { queue, updateStatus, removeFromQueue } = useUploadQueue();
    const [isOpen, setIsOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'error').length;

    const handleSync = async () => {
        if (isSyncing || pendingCount === 0) return;

        setIsSyncing(true);
        const toUpload = queue.filter(q => q.status === 'pending' || q.status === 'error');

        for (const item of toUpload) {
            try {
                updateStatus(item.id, 'uploading');

                const formData = new FormData();
                formData.append('pekerjaan_id', item.pekerjaanId.toString());
                formData.append('komponen_id', item.komponenId?.toString() || '');
                formData.append('keterangan', item.keterangan);
                formData.append('koordinat', item.koordinat);
                if (item.penerimaId) {
                    formData.append('penerima_id', item.penerimaId.toString());
                }
                formData.append('file', item.fileBlob, item.fileName);

                await createFoto(formData);
                removeFromQueue(item.id);
                toast.success(`Berhasil upload: ${item.fileName}`);
            } catch (error: any) {
                console.error('Retry upload failed:', error);
                updateStatus(item.id, 'error', error.response?.data?.message || 'Gagal upload');
            }
        }
        setIsSyncing(false);
    };

    if (queue.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="lg"
                        className={`rounded-full shadow-lg gap-2 ${pendingCount > 0 ? 'animate-pulse' : ''}`}
                        variant={pendingCount > 0 ? 'default' : 'secondary'}
                    >
                        {isSyncing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : pendingCount > 0 ? (
                            <CloudUpload className="h-5 w-5" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        <span>{queue.length} Foto</span>
                        {pendingCount > 0 && (
                            <Badge variant="destructive" className="ml-1 px-1.5 min-w-[20px] h-5">
                                {pendingCount}
                            </Badge>
                        )}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Antrean Upload Foto
                            <Badge variant="outline">{queue.length}</Badge>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-3 py-4">
                        {queue.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden border">
                                    {item.status === 'uploading' ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    ) : (
                                        <CloudOff className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.fileName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.status === 'error' ? (
                                            <span className="text-[10px] text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Gagal: {item.errorMessage}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    {item.status === 'uploading' && (
                                        <div className="h-1 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-primary animate-pulse w-full" />
                                        </div>
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground"
                                    onClick={() => removeFromQueue(item.id)}
                                    disabled={isSyncing}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t flex gap-2">
                        <Button
                            className="flex-1"
                            onClick={handleSync}
                            disabled={isSyncing || pendingCount === 0}
                        >
                            {isSyncing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Sinkronisasi Sekarang
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
