import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Banknote,
    Calendar,
    HardHat,
    Info,
    Loader2,
    Plus,
    Trash2,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { DatePickerField } from '@/components/shared/DatePickerField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import {
    getPekerjaanProgressEstimasi,
    savePekerjaanProgressEstimasi,
    type ProgressHistoryEntry,
    type ProgressEstimasiSection,
    type PuspenProgressFisikSnapshot,
} from '../api/progress-estimasi';

type HistoryDraft = { tanggal: string; persen: string };

type SectionHistories = {
    rencana: ProgressHistoryEntry[];
    realisasi: ProgressHistoryEntry[];
};

type FormHistories = {
    fisik: SectionHistories;
    keuangan: SectionHistories;
};

const emptyDraft = (): HistoryDraft => ({ tanggal: '', persen: '' });

const historiesFromResponse = (data: {
    fisik: ProgressEstimasiSection;
    keuangan: ProgressEstimasiSection;
}): FormHistories => ({
    fisik: { rencana: data.fisik.rencana, realisasi: data.fisik.realisasi },
    keuangan: { rencana: data.keuangan.rencana, realisasi: data.keuangan.realisasi },
});

const sanitizePercentInput = (value: string) => {
    let sanitized = value.replace(/[^0-9,.]/g, '');
    const separatorIndex = sanitized.search(/[,.]/);

    if (separatorIndex !== -1) {
        const before = sanitized.slice(0, separatorIndex);
        const separator = sanitized[separatorIndex];
        const after = sanitized.slice(separatorIndex + 1).replace(/[,.]/g, '');
        sanitized = `${before}${separator}${after}`;
    }

    return sanitized;
};

const parsePercent = (value: string): number | null => {
    const normalized = value.replace(',', '.').trim();
    if (normalized === '') return null;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
};

const sortEntries = (entries: ProgressHistoryEntry[]) =>
    [...entries].sort((a, b) => a.tanggal.localeCompare(b.tanggal) || (a.id ?? 0) - (b.id ?? 0));

function SummaryStrip({ section, accentClass }: { section: ProgressEstimasiSection; accentClass: string }) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Rencana Terakhir</p>
                <p className="mt-1 text-2xl font-bold">{formatPercent(section.latest_rencana)}%</p>
            </div>
            <div className={`rounded-xl border p-4 text-white ${accentClass}`}>
                <p className="text-xs uppercase tracking-wide text-white/80">Realisasi Terakhir</p>
                <p className="mt-1 text-2xl font-bold">{formatPercent(section.latest_realisasi)}%</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Deviasi</p>
                <p
                    className={`mt-1 flex items-center gap-2 text-2xl font-bold ${
                        section.deviasi !== null && section.deviasi < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                >
                    {section.deviasi !== null && section.deviasi < 0 ? (
                        <TrendingDown className="h-5 w-5" />
                    ) : (
                        <TrendingUp className="h-5 w-5" />
                    )}
                    {formatPercent(section.deviasi)}%
                </p>
            </div>
        </div>
    );
}

function HistoryColumn({
    title,
    subtitle,
    entries,
    draft,
    accentClass,
    isSaving,
    onDraftChange,
    onAdd,
    onRemove,
}: {
    title: string;
    subtitle: string;
    entries: ProgressHistoryEntry[];
    draft: HistoryDraft;
    accentClass: string;
    isSaving: boolean;
    onDraftChange: (draft: HistoryDraft) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
}) {
    const sorted = sortEntries(entries);

    return (
        <div className="flex h-full flex-col rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <Badge variant="secondary">{sorted.length} catatan</Badge>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_110px_auto] sm:items-end">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Tanggal</Label>
                        <DatePickerField
                            value={draft.tanggal}
                            onChange={(tanggal) => onDraftChange({ ...draft, tanggal })}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Nilai (%)</Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            value={draft.persen}
                            onChange={(event) =>
                                onDraftChange({ ...draft, persen: sanitizePercentInput(event.target.value) })
                            }
                            placeholder="0-100"
                            className="text-right font-semibold"
                            disabled={isSaving}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    onAdd();
                                }
                            }}
                        />
                    </div>
                    <Button type="button" onClick={onAdd} disabled={isSaving} className="sm:mb-0">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah
                            </>
                        )}
                    </Button>
                </div>

                {sorted.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                        Belum ada riwayat. Tambahkan catatan dari 0% menuju 100%.
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${accentClass}`}
                                style={{ width: `${Math.min(sorted[sorted.length - 1]?.persen ?? 0, 100)}%` }}
                            />
                        </div>

                        <div className="space-y-2">
                            {sorted.map((entry, index) => (
                                <div
                                    key={`${entry.tanggal}-${entry.persen}-${index}`}
                                    className="flex items-center gap-3 rounded-xl border bg-muted/10 px-4 py-3"
                                >
                                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${accentClass}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">{formatDate(entry.tanggal)}</p>
                                        <p className="text-sm text-muted-foreground">Pencatatan #{index + 1}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{formatPercent(entry.persen)}%</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-destructive"
                                        onClick={() => onRemove(index)}
                                        disabled={isSaving}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProgressTypePanel({
    jenis,
    section,
    histories,
    drafts,
    accentClass,
    isSaving,
    onDraftChange,
    onAdd,
    onRemove,
}: {
    jenis: 'fisik' | 'keuangan';
    section: ProgressEstimasiSection;
    histories: SectionHistories;
    drafts: { rencana: HistoryDraft; realisasi: HistoryDraft };
    accentClass: string;
    isSaving: boolean;
    onDraftChange: (tipe: 'rencana' | 'realisasi', draft: HistoryDraft) => void;
    onAdd: (tipe: 'rencana' | 'realisasi') => void;
    onRemove: (tipe: 'rencana' | 'realisasi', index: number) => void;
}) {
    return (
        <div className="space-y-5">
            <SummaryStrip section={section} accentClass={accentClass} />
            <div className="grid gap-5 xl:grid-cols-2">
                <HistoryColumn
                    title="Rencana"
                    subtitle={`Target ${jenis} per tanggal`}
                    entries={histories.rencana}
                    draft={drafts.rencana}
                    accentClass="bg-amber-500"
                    isSaving={isSaving}
                    onDraftChange={(draft) => onDraftChange('rencana', draft)}
                    onAdd={() => onAdd('rencana')}
                    onRemove={(index) => onRemove('rencana', index)}
                />
                <HistoryColumn
                    title="Realisasi"
                    subtitle={`Capaian ${jenis} per tanggal`}
                    entries={histories.realisasi}
                    draft={drafts.realisasi}
                    accentClass={accentClass}
                    isSaving={isSaving}
                    onDraftChange={(draft) => onDraftChange('realisasi', draft)}
                    onAdd={() => onAdd('realisasi')}
                    onRemove={(index) => onRemove('realisasi', index)}
                />
            </div>
        </div>
    );
}

interface PekerjaanProgressEstimasiTabProps {
    pekerjaanId: number;
}

export default function PekerjaanProgressEstimasiTab({ pekerjaanId }: PekerjaanProgressEstimasiTabProps) {
    const queryClient = useQueryClient();
    const { tahunAnggaran } = useAppSettingsValues();
    const tahun = Number(tahunAnggaran) || new Date().getFullYear();

    const [drafts, setDrafts] = useState({
        fisik: { rencana: emptyDraft(), realisasi: emptyDraft() },
        keuangan: { rencana: emptyDraft(), realisasi: emptyDraft() },
    });

    const { data, isLoading } = useQuery({
        queryKey: ['pekerjaan-progress-estimasi', pekerjaanId, tahun],
        queryFn: () => getPekerjaanProgressEstimasi(pekerjaanId, tahun),
        enabled: pekerjaanId > 0,
    });

    const [histories, setHistories] = useState<FormHistories | null>(null);

    useEffect(() => {
        if (!data?.data) return;
        setHistories(historiesFromResponse(data.data));
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: (nextHistories: FormHistories) =>
            savePekerjaanProgressEstimasi(pekerjaanId, {
                tahun,
                fisik: {
                    rencana: nextHistories.fisik.rencana.map(({ tanggal, persen }) => ({ tanggal, persen })),
                    realisasi: nextHistories.fisik.realisasi.map(({ tanggal, persen }) => ({ tanggal, persen })),
                },
                keuangan: {
                    rencana: nextHistories.keuangan.rencana.map(({ tanggal, persen }) => ({ tanggal, persen })),
                    realisasi: nextHistories.keuangan.realisasi.map(({ tanggal, persen }) => ({ tanggal, persen })),
                },
            }),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['pekerjaan-progress-estimasi', pekerjaanId] }),
                queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik'] }),
            ]);
        },
        onError: () => {
            toast.error('Gagal menyimpan perubahan');
        },
    });

    const persist = (nextHistories: FormHistories) => {
        saveMutation.mutate(nextHistories);
    };

    const handleDraftChange = (
        section: 'fisik' | 'keuangan',
        tipe: 'rencana' | 'realisasi',
        draft: HistoryDraft,
    ) => {
        setDrafts((current) => ({
            ...current,
            [section]: { ...current[section], [tipe]: draft },
        }));
    };

    const handleAdd = (section: 'fisik' | 'keuangan', tipe: 'rencana' | 'realisasi') => {
        if (!histories) return;

        const draft = drafts[section][tipe];
        const persen = parsePercent(draft.persen);

        if (!draft.tanggal) {
            toast.error('Tanggal wajib diisi');
            return;
        }

        if (persen === null || persen < 0 || persen > 100) {
            toast.error('Nilai harus antara 0 dan 100');
            return;
        }

        const nextHistories: FormHistories = {
            ...histories,
            [section]: {
                ...histories[section],
                [tipe]: sortEntries([
                    ...histories[section][tipe],
                    { tanggal: draft.tanggal, persen },
                ]),
            },
        };

        setHistories(nextHistories);
        setDrafts((current) => ({
            ...current,
            [section]: { ...current[section], [tipe]: emptyDraft() },
        }));

        persist(nextHistories);
    };

    const handleRemove = (
        section: 'fisik' | 'keuangan',
        tipe: 'rencana' | 'realisasi',
        index: number,
    ) => {
        if (!histories) return;

        const sorted = sortEntries(histories[section][tipe]);
        const nextHistories: FormHistories = {
            ...histories,
            [section]: {
                ...histories[section],
                [tipe]: sorted.filter((_, itemIndex) => itemIndex !== index),
            },
        };

        setHistories(nextHistories);
        persist(nextHistories);
    };

    const puspenItems = data?.puspen_progress_fisik ?? [];
    const emptySection: ProgressEstimasiSection = {
        rencana: [],
        realisasi: [],
        latest_rencana: null,
        latest_realisasi: null,
        deviasi: null,
    };

    if (isLoading || !histories) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {puspenItems.length > 0 && (
                <Card className="border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Info className="h-4 w-4" />
                            Referensi Puspen Progress Fisik
                        </CardTitle>
                        <CardDescription>
                            Progress fisik disinkronkan dua arah dengan Puspen. Nilai terakhir di sini memperbarui
                            halaman Puspen progress fisik untuk kontrak terkait.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {puspenItems.map((item: PuspenProgressFisikSnapshot) => (
                            <Badge key={item.kontrak_id} variant="outline" className="px-3 py-2 text-sm font-normal">
                                {item.kode_paket || `Kontrak #${item.kontrak_id}`}: Rencana{' '}
                                {formatPercent(item.rencana)}% - Realisasi {formatPercent(item.realisasi)}%
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="fisik" className="space-y-5">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="fisik" className="gap-2">
                        <HardHat className="h-4 w-4" />
                        Progress Fisik
                    </TabsTrigger>
                    <TabsTrigger value="keuangan" className="gap-2">
                        <Banknote className="h-4 w-4" />
                        Progress Keuangan
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="fisik">
                    <ProgressTypePanel
                        jenis="fisik"
                        section={data?.data.fisik ?? emptySection}
                        histories={histories.fisik}
                        drafts={drafts.fisik}
                        accentClass="bg-amber-500"
                        isSaving={saveMutation.isPending}
                        onDraftChange={(tipe, draft) => handleDraftChange('fisik', tipe, draft)}
                        onAdd={(tipe) => handleAdd('fisik', tipe)}
                        onRemove={(tipe, index) => handleRemove('fisik', tipe, index)}
                    />
                </TabsContent>

                <TabsContent value="keuangan">
                    <ProgressTypePanel
                        jenis="keuangan"
                        section={data?.data.keuangan ?? emptySection}
                        histories={histories.keuangan}
                        drafts={drafts.keuangan}
                        accentClass="bg-emerald-600"
                        isSaving={saveMutation.isPending}
                        onDraftChange={(tipe, draft) => handleDraftChange('keuangan', tipe, draft)}
                        onAdd={(tipe) => handleAdd('keuangan', tipe)}
                        onRemove={(tipe, index) => handleRemove('keuangan', tipe, index)}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}