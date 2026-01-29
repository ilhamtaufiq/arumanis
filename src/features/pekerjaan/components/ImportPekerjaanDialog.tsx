import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, Loader2, Download } from 'lucide-react';
import { importPekerjaan, downloadPekerjaanTemplate } from '../api/pekerjaan';
import { toast } from 'sonner';

interface ImportPekerjaanDialogProps {
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function ImportPekerjaanDialog({ onSuccess, trigger }: ImportPekerjaanDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Silakan pilih file terlebih dahulu');
            return;
        }

        try {
            setUploading(true);
            await importPekerjaan(file);
            toast.success('Data pekerjaan berhasil diimport');
            setOpen(false);
            setFile(null);
            onSuccess();
        } catch (error: any) {
            console.error('Failed to import pekerjaan:', error);
            const data = error.response?.data;
            const message = data?.message || 'Gagal mengimport data pekerjaan';

            if (data?.errors && Array.isArray(data.errors)) {
                toast.error(`${message}: ${data.errors.join('; ')}`, {
                    duration: 5000
                });
            } else {
                toast.error(message);
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <FileUp className="mr-2 h-4 w-4" /> Import Excel
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Data Pekerjaan</DialogTitle>
                    <div className="flex items-center justify-between">
                        <DialogDescription>
                            Upload file Excel (.xlsx, .xls) atau CSV untuk menambah data pekerjaan secara massal.
                        </DialogDescription>
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => downloadPekerjaanTemplate()}
                        >
                            <Download className="mr-1 h-3 w-3" /> Template
                        </Button>
                    </div>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="file">File Excel/CSV</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Format kolom: kode_rekening, nama_paket, kecamatan, desa, kegiatan, tahun, pagu
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        disabled={!file || uploading}
                        onClick={handleUpload}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengupload...
                            </>
                        ) : (
                            'Upload'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
