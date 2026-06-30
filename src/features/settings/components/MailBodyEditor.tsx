import { useMemo, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, FileCode, FileText, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import type { MailBodyFormat } from '../constants/mail-settings';

interface MailBodyEditorProps {
    format: MailBodyFormat;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const FORMAT_HINT: Record<MailBodyFormat, string> = {
    markdown: 'Markdown untuk isi email. Logo & warna dari Pengaturan Aplikasi ditambahkan otomatis.',
    html: 'HTML untuk isi email. Logo & warna dari Pengaturan Aplikasi ditambahkan otomatis.',
    plain: 'Teks biasa. Header & footer teks ditambahkan otomatis saat dikirim.',
};

function darkenHex(hex: string, ratio = 0.12): string {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return hex;

    const r = Math.max(0, Math.round(parseInt(normalized.slice(0, 2), 16) * (1 - ratio)));
    const g = Math.max(0, Math.round(parseInt(normalized.slice(2, 4), 16) * (1 - ratio)));
    const b = Math.max(0, Math.round(parseInt(normalized.slice(4, 6), 16) * (1 - ratio)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function EmailPreviewFrame({
    children,
    format,
    appName,
    logoUrl,
    primaryColor,
}: {
    children: ReactNode;
    format: MailBodyFormat;
    appName: string;
    logoUrl: string;
    primaryColor: string;
}) {
    const primaryDark = darkenHex(primaryColor);

    return (
        <div className="overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-900">
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)` }}
            >
                <div className="flex items-center gap-2">
                    {logoUrl ? (
                        <img src={logoUrl} alt={appName || 'Logo'} className="h-8 max-w-[120px] object-contain" />
                    ) : (
                        <div className="flex h-8 min-w-8 items-center justify-center rounded bg-white/15 px-2 text-xs font-bold text-white">
                            {appName ? appName.slice(0, 1).toUpperCase() : 'A'}
                        </div>
                    )}
                    {!logoUrl && appName ? (
                        <span className="text-sm font-semibold text-white">{appName}</span>
                    ) : null}
                </div>
                <span className="text-[10px] uppercase tracking-wide text-white/80">Notifikasi Resmi</span>
            </div>
            <div className="border-x border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                {format !== 'plain' ? (
                    <div className="mb-2 text-[10px] text-muted-foreground">
                        Pratinjau isi email · logo & warna dari Pengaturan Aplikasi
                    </div>
                ) : null}
                {children}
            </div>
            <div className="space-y-1 rounded-b-lg border border-t-0 border-slate-200 bg-slate-50 px-4 py-3 text-center text-[10px] leading-relaxed text-muted-foreground dark:border-slate-800 dark:bg-slate-900">
                <p>
                    Pesan ini dikirim secara otomatis oleh sistem{' '}
                    <span className="font-medium text-foreground/80">{appName || 'Arumanis'}</span>. Harap tidak
                    membalas email ini.
                </p>
                <p>© {new Date().getFullYear()} {appName || 'Arumanis'}. Seluruh hak cipta dilindungi.</p>
            </div>
        </div>
    );
}

export function MailBodyEditor({ format, value, onChange, disabled }: MailBodyEditorProps) {
    const [tab, setTab] = useState<'edit' | 'preview'>('edit');
    const { appName, logoUrl, brandPrimaryColor } = useAppSettingsValues();

    const preview = useMemo(() => {
        if (format === 'html') {
            return (
                <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            );
        }

        if (format === 'markdown') {
            return (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '_Kosong_'}</ReactMarkdown>
                </div>
            );
        }

        return (
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{value || 'Kosong'}</pre>
        );
    }, [format, value]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <Label>Isi Email</Label>
                <span className="text-xs text-muted-foreground">{FORMAT_HINT[format]}</span>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'edit' | 'preview')}>
                <TabsList className="grid w-full max-w-[280px] grid-cols-2">
                    <TabsTrigger value="edit" className="gap-1.5" disabled={disabled}>
                        <Pencil className="h-3.5 w-3.5" />
                        Tulis
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-1.5" disabled={disabled}>
                        <Eye className="h-3.5 w-3.5" />
                        Pratinjau
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-3">
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        rows={format === 'plain' ? 8 : 12}
                        className={cn(
                            'font-mono text-sm',
                            format === 'html' && 'min-h-[220px]',
                            format === 'markdown' && 'min-h-[220px]'
                        )}
                        placeholder={
                            format === 'html'
                                ? '<h2>Judul</h2>\n<p>Isi email...</p>'
                                : format === 'markdown'
                                  ? '# Judul\n\nIsi email **penting**...'
                                  : 'Isi email dalam teks biasa...'
                        }
                    />
                </TabsContent>

                <TabsContent value="preview" className="mt-3">
                    <EmailPreviewFrame
                        format={format}
                        appName={appName}
                        logoUrl={logoUrl}
                        primaryColor={brandPrimaryColor}
                    >
                        {format === 'html' ? (
                            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FileCode className="h-3.5 w-3.5" />
                                Pratinjau HTML
                            </div>
                        ) : format === 'markdown' ? (
                            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                                Pratinjau Markdown
                            </div>
                        ) : null}
                        {preview}
                    </EmailPreviewFrame>
                </TabsContent>
            </Tabs>
        </div>
    );
}