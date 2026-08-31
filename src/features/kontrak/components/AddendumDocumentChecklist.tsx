import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Eye, FileText, Pencil, XCircle } from 'lucide-react';
import type { KontrakAddendumAttachment } from '../types';
import { buildAttachmentChecklist } from '../lib/addendum-constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlobPreviewModal } from '@/components/shared/BlobPreviewModal';

type AddendumDocumentChecklistProps = {
    attachments?: KontrakAddendumAttachment[];
    attachmentNomors?: Record<string, { nomor: string; tanggal?: string | null }> | null;
    isAdmin?: boolean;
    onSaveNumbers?: (numbers: Record<string, { nomor?: string; tanggal?: string }>) => Promise<void> | void;
    savingNumbers?: boolean;
};

const formatDate = (value?: string | null) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function AddendumDocumentChecklist({
    attachments,
    attachmentNomors,
    isAdmin,
    onSaveNumbers,
    savingNumbers,
}: AddendumDocumentChecklistProps) {
    const checklist = buildAttachmentChecklist(attachments, attachmentNomors);
    const [preview, setPreview] = useState<KontrakAddendumAttachment | null>(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Record<string, { nomor: string; tanggal: string }>>({});

    useEffect(() => {
        if (editing) {
            setForm(Object.fromEntries(
                checklist.map((item) => [item.type, { nomor: item.nomor || '', tanggal: item.tanggal || '' }]),
            ));
        }
    }, [editing]);

    return (
        <>
            {isAdmin && onSaveNumbers && (
                <div className="mb-3 flex justify-end">
                    {editing ? (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={savingNumbers}>
                                Batal
                            </Button>
                            <Button
                                size="sm"
                                disabled={savingNumbers}
                                onClick={async () => {
                                    await onSaveNumbers(form);
                                    setEditing(false);
                                }}
                            >
                                Simpan Nomor
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit Nomor
                        </Button>
                    )}
                </div>
            )}

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
                                {editing ? (
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <Input
                                            placeholder="Nomor dokumen"
                                            value={form[item.type]?.nomor || ''}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    [item.type]: { ...prev[item.type], nomor: event.target.value },
                                                }))
                                            }
                                        />
                                        <Input
                                            type="date"
                                            value={form[item.type]?.tanggal || ''}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    [item.type]: { ...prev[item.type], tanggal: event.target.value },
                                                }))
                                            }
                                        />
                                    </div>
                                ) : item.nomor ? (
                                    <p className="text-xs font-mono text-foreground">
                                        {item.nomor}
                                        {item.tanggal ? <span className="font-sans text-muted-foreground"> · {formatDate(item.tanggal)}</span> : null}
                                    </p>
                                ) : null}
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
