import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    downloadKontrakDocTemplate,
    uploadKontrakTemplate,
    useKontrakTemplates,
} from '../api';
import type { KontrakTemplateFormField, KontrakTemplateMeta } from '../constants/kontrak-templates';

function triggerBlobDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function getTemplateAccept(format: KontrakTemplateMeta['format']) {
    if (format === 'xlsx') {
        return {
            label: 'Upload .xlsx',
            accept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
    }

    return {
        label: 'Upload .docx',
        accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
}

function TemplateRow({ template }: { template: KontrakTemplateMeta }) {
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const uploadConfig = getTemplateAccept(template.format);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const blob = await downloadKontrakDocTemplate(template.key);
            const filename = template.has_custom
                ? template.filename || template.default_filename
                : template.default_filename;
            triggerBlobDownload(blob, filename);
            toast.success(`Template ${template.label} berhasil diunduh`);
        } catch {
            toast.error(`Gagal mengunduh template ${template.label}`);
        } finally {
            setDownloading(false);
        }
    };

    const handleUpload = async (file: File) => {
        try {
            setUploading(true);
            await uploadKontrakTemplate(template.form_field as KontrakTemplateFormField, file);
            await queryClient.invalidateQueries({ queryKey: ['kontrak-templates'] });
            await queryClient.invalidateQueries({ queryKey: ['app-settings'] });
            toast.success(`Template ${template.label} berhasil diunggah`);
        } catch {
            toast.error(`Gagal mengunggah template ${template.label}`);
        } finally {
            setUploading(false);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-slate-50/50 p-4 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{template.label}</p>
                    <Badge variant={template.has_custom ? 'default' : 'secondary'}>
                        {template.has_custom ? 'Custom' : 'Default'}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <p className="text-xs text-muted-foreground">
                    File: {template.has_custom ? template.filename : template.default_filename}
                    {template.updated_at
                        ? ` • Diperbarui ${new Date(template.updated_at).toLocaleString('id-ID')}`
                        : ''}
                </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleDownload}
                    disabled={downloading || uploading}
                >
                    {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Unduh
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="gap-2"
                    onClick={() => inputRef.current?.click()}
                    disabled={downloading || uploading}
                >
                    {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    {uploadConfig.label}
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={uploadConfig.accept}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUpload(file);
                    }}
                />
            </div>
        </div>
    );
}

export default function KontrakTemplateSettings() {
    const { data, isLoading, error } = useKontrakTemplates();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-destructive">
                    Gagal memuat template kontrak: {error.message}
                </CardContent>
            </Card>
        );
    }

    const templates = data?.data ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Template Dokumen Kontrak
                </CardTitle>
                <CardDescription>
                    Kelola template dokumen kontrak: Word (.docx) untuk SPK, cover, dan BAP; Excel (.xlsx)
                    untuk ringkasan kontrak. Unduh template aktif, edit di Office, lalu upload ulang tanpa mengubah kode.
                    Placeholder dokumen memakai format kurung kurawal, misalnya{' '}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{'{nama_paket}'}</code> dan{' '}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{'{nilai_kontrak}'}</code>.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {templates.map((template) => (
                    <TemplateRow key={template.key} template={template} />
                ))}
            </CardContent>
        </Card>
    );
}