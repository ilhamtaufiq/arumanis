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

function mixWithWhite(hex: string, whiteRatio = 0.88): string {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return hex;

    const colorRatio = 1 - whiteRatio;
    const r = Math.round(parseInt(normalized.slice(0, 2), 16) * colorRatio + 255 * whiteRatio);
    const g = Math.round(parseInt(normalized.slice(2, 4), 16) * colorRatio + 255 * whiteRatio);
    const b = Math.round(parseInt(normalized.slice(4, 6), 16) * colorRatio + 255 * whiteRatio);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const ARUMANIS_PURPLE = '#674bb5';

function buildEmailPalette(primaryColor: string) {
    const primary = primaryColor || ARUMANIS_PURPLE;
    const primaryDark = darkenHex(primary, 0.14);
    const secondary = darkenHex(primary, 0.22);

    return {
        primary,
        primaryDark,
        primaryFixed: mixWithWhite(primary, 0.88),
        primaryContainer: mixWithWhite(primary, 0.86),
        secondary,
        secondaryFixed: mixWithWhite(secondary, 0.78),
        onSecondaryFixed: darkenHex(secondary, 0.08),
        surface: mixWithWhite(primary, 0.965),
        surfaceContainerLow: mixWithWhite(primary, 0.93),
        outlineVariant: mixWithWhite(primary, 0.72),
        onSurface: '#1f1926',
        onSurfaceVariant: '#50434b',
    };
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
    const palette = buildEmailPalette(primaryColor);

    return (
        <div
            className="overflow-hidden rounded-2xl"
            style={{
                backgroundColor: palette.surface,
                boxShadow: `0 4px 24px -8px ${palette.primaryContainer}`,
            }}
        >
            <div className="px-6 py-8 text-center" style={{ backgroundColor: palette.primaryFixed }}>
                <div className="mb-1 text-xl opacity-35" style={{ color: palette.primary }}>
                    ✦
                </div>
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={appName || 'Logo'}
                        className="mx-auto h-20 max-w-[160px] object-contain"
                    />
                ) : (
                    <div
                        className="text-2xl font-extrabold tracking-tight"
                        style={{ color: palette.primary }}
                    >
                        {appName || 'Arumanis'}
                    </div>
                )}
                <p
                    className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: palette.onSurfaceVariant }}
                >
                    Notifikasi Resmi
                </p>
            </div>

            <div className="px-5 py-5" style={{ backgroundColor: palette.surface }}>
                <div
                    className="rounded-2xl border bg-white p-5"
                    style={{ borderColor: palette.outlineVariant }}
                >
                    {format !== 'plain' ? (
                        <div className="mb-3 text-[10px]" style={{ color: palette.onSurfaceVariant }}>
                            Pratinjau isi email · logo & warna dari Pengaturan Aplikasi
                        </div>
                    ) : null}
                    {children}
                </div>
            </div>

            <div
                className="space-y-1.5 border-t px-5 py-4 text-center text-[10px] leading-relaxed"
                style={{
                    backgroundColor: palette.surfaceContainerLow,
                    borderColor: palette.outlineVariant,
                    color: palette.onSurfaceVariant,
                }}
            >
                <p className="text-sm font-bold" style={{ color: palette.primaryDark }}>
                    {appName || 'Arumanis'}
                </p>
                <p style={{ color: palette.onSurface }}>
                    Pesan ini dikirim secara otomatis oleh sistem{' '}
                    <strong style={{ color: palette.primaryDark }}>{appName || 'Arumanis'}</strong>. Harap tidak
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