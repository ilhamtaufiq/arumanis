import { useState } from 'react';
import { CheckCircle2, Download, Eye, FileText, XCircle } from 'lucide-react';
import type { KontrakAddendumAttachment } from '../types';
import { buildAttachmentChecklist } from '../lib/addendum-constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlobPreviewModal } from '@/components/shared/BlobPreviewModal';

type AddendumDocumentChecklistProps = {
    attachments?: KontrakAddendumAttachment[];
};

export function AddendumDocumentChecklist({ attachments }: AddendumDocumentChecklistProps) {
    const checklist = buildAttachmentChecklist(attachments);
    const [preview, setPreview] = useState<KontrakAddendumAttachment | null>(null);

    return (
        <>
            <div className="space-y-2">
                {checklist.map((item) => (
                    <div
                        key={item.type}
                        className="flex flex-col gap-3 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3 min-w-0">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium">{item.label}</p>
                                {item.file ? (
                                    <p className="text-xs text-muted-foreground truncate">{item.file.name}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Belum diunggah</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge
                                variant="outline"
                                className={
                                    item.uploaded
                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                                }
                            >
                                {item.uploaded ? (
                                    <span className="inline-flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Lengkap
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        Belum ada
                                    </span>
                                )}
                            </Badge>
                            {item.file && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreview(item.file!)}
                                    >
                                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                                        Pratinjau
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={item.file.url} download={item.file.name} target="_blank" rel="noreferrer">
                                            <Download className="mr-1.5 h-3.5 w-3.5" />
                                            Unduh
                                        </a>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {preview && (
                <BlobPreviewModal
                    isOpen={Boolean(preview)}
                    onClose={() => setPreview(null)}
                    uri={preview.url}
                    fileName={preview.name}
                    title={preview.label || preview.name}
                />
            )}
        </>
    );
}