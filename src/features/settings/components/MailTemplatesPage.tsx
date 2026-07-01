import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Mail, RotateCcw, Save, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    saveMailTemplates,
    testMailTemplate,
    useMailTemplates,
} from '../api';
import {
    EMAIL_TEMPLATE_CATEGORY_LABELS,
    groupTemplatesByCategory,
    PLACEHOLDER_HINTS,
    type EmailTemplateDraft,
    type EmailTemplateKey,
    type EmailTemplateMeta,
} from '../constants/email-templates';
import type { MailBodyFormat } from '../constants/mail-settings';
import { MailBodyEditor } from './MailBodyEditor';
import { SettingsSubNav } from './SettingsSubNav';

function toDraftMap(templates: EmailTemplateMeta[]) {
    return Object.fromEntries(
        templates.map((template) => [
            template.key,
            {
                format: template.format,
                subject: template.subject,
                body: template.body,
            } satisfies EmailTemplateDraft,
        ])
    ) as Record<EmailTemplateKey, EmailTemplateDraft>;
}

export default function MailTemplatesPage() {
    const { data, isLoading, error, refetch } = useMailTemplates();
    const templates = data?.data ?? [];

    const [selectedKey, setSelectedKey] = useState<EmailTemplateKey>('smtp_test');
    const [drafts, setDrafts] = useState<Record<string, EmailTemplateDraft>>({});
    const [testTo, setTestTo] = useState('');
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

    useEffect(() => {
        if (templates.length === 0) return;
        setDrafts(toDraftMap(templates));
        if (!templates.some((template) => template.key === selectedKey)) {
            setSelectedKey(templates[0].key);
        }
    }, [templates]);

    const grouped = useMemo(() => groupTemplatesByCategory(templates), [templates]);

    const selectedMeta = templates.find((template) => template.key === selectedKey);
    const selectedDraft = drafts[selectedKey];

    const updateDraft = (patch: Partial<EmailTemplateDraft>) => {
        if (!selectedKey) return;
        setDrafts((current) => ({
            ...current,
            [selectedKey]: {
                ...current[selectedKey],
                ...patch,
            },
        }));
    };

    const handleFormatChange = (format: MailBodyFormat) => {
        updateDraft({ format });
    };

    const handleLoadPreset = () => {
        if (!selectedMeta || !selectedDraft) return;
        const preset = selectedMeta.presets[selectedDraft.format];
        if (!preset) return;
        updateDraft({ subject: preset.subject, body: preset.body });
        toast.message('Contoh default dimuat');
    };

    const handleResetTemplate = () => {
        if (!selectedMeta) return;
        setDrafts((current) => ({
            ...current,
            [selectedKey]: {
                format: selectedMeta.format,
                subject: selectedMeta.subject,
                body: selectedMeta.body,
            },
        }));
        toast.message('Template dikembalikan ke nilai terakhir dari server');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await saveMailTemplates(drafts);
            await refetch();
            toast.success('Semua template email berhasil disimpan');
        } catch {
            toast.error('Gagal menyimpan template email');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!selectedDraft) return;
        const to = testTo.trim();
        if (!to) {
            setTestResult({ ok: false, error: 'Isi alamat email tujuan uji.' });
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            const result = await testMailTemplate(selectedKey, to, selectedDraft);
            setTestResult(result);
            if (result.ok) {
                toast.success(`Email uji template "${selectedMeta?.label}" terkirim`);
            }
        } finally {
            setTesting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-[480px] w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-destructive">
                Gagal memuat template email: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <Link
                        to="/settings"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke pengaturan
                    </Link>
                    <div className="flex items-center gap-3">
                        <Mail className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Template Email</h1>
                            <p className="text-muted-foreground">
                                Kelola subjek dan isi email transaksional. Dukung Markdown, HTML, atau teks biasa.
                            </p>
                        </div>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 self-start">
                    <Save className="h-4 w-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Semua Template'}
                </Button>
            </div>

            <SettingsSubNav />

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <Card className="h-fit">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Katalog Template</CardTitle>
                        <CardDescription>{templates.length} template rekomendasi</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {grouped.map((group) => (
                            <div key={group.category} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {EMAIL_TEMPLATE_CATEGORY_LABELS[group.category]}
                                </p>
                                <div className="space-y-1">
                                    {group.templates.map((template) => {
                                        const isActive = template.key === selectedKey;
                                        return (
                                            <button
                                                key={template.key}
                                                type="button"
                                                onClick={() => setSelectedKey(template.key)}
                                                className={cn(
                                                    'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                                                    isActive
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-transparent hover:bg-muted/60'
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium">{template.label}</span>
                                                    {template.is_custom && (
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            Custom
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {template.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {selectedMeta && selectedDraft ? (
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <CardTitle>{selectedMeta.label}</CardTitle>
                                    <CardDescription className="mt-1">{selectedMeta.description}</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleResetTemplate}>
                                    <RotateCcw className="h-4 w-4" />
                                    Muat ulang
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-lg border bg-slate-50/60 p-4 dark:bg-slate-900/40">
                                <p className="mb-2 text-sm font-medium">Placeholder yang tersedia</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMeta.placeholders.map((placeholder) => (
                                        <Badge key={placeholder} variant="outline" className="font-mono text-xs">
                                            {`{{${placeholder}}}`}
                                            <span className="ml-1 font-sans text-muted-foreground">
                                                {PLACEHOLDER_HINTS[placeholder] ? `— ${PLACEHOLDER_HINTS[placeholder]}` : ''}
                                            </span>
                                        </Badge>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    Saat uji kirim, placeholder diisi dengan data contoh. Saat produksi, sistem menggantinya dengan data aktual.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="template_format">Format</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={selectedDraft.format}
                                            onValueChange={(value) => handleFormatChange(value as MailBodyFormat)}
                                        >
                                            <SelectTrigger id="template_format" className="flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="markdown">Markdown</SelectItem>
                                                <SelectItem value="html">HTML</SelectItem>
                                                <SelectItem value="plain">Teks biasa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="sm" onClick={handleLoadPreset}>
                                            Muat contoh
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="template_subject">Subjek Email</Label>
                                    <Input
                                        id="template_subject"
                                        value={selectedDraft.subject}
                                        onChange={(e) => updateDraft({ subject: e.target.value })}
                                        placeholder="Subjek email..."
                                    />
                                </div>
                            </div>

                            <MailBodyEditor
                                format={selectedDraft.format}
                                value={selectedDraft.body}
                                onChange={(body) => updateDraft({ body })}
                            />

                            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="template_test_to">Email Tujuan Uji</Label>
                                    <Input
                                        id="template_test_to"
                                        type="email"
                                        value={testTo}
                                        onChange={(e) => setTestTo(e.target.value)}
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleTest}
                                    disabled={testing}
                                    className="gap-2 sm:mb-0.5"
                                >
                                    <Wifi className="h-4 w-4" />
                                    {testing ? 'Mengirim...' : 'Uji Kirim Template'}
                                </Button>
                            </div>
                            {testResult && (
                                <p className={`text-sm ${testResult.ok ? 'text-green-600' : 'text-destructive'}`}>
                                    {testResult.ok ? 'Email uji berhasil dikirim.' : `Gagal: ${testResult.error}`}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </div>
    );
}