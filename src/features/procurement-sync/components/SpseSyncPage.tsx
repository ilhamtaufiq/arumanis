import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
    BookmarkPlus,
    ChevronLeft,
    ChevronRight,
    Copy,
    FileDown,
    Link2,
    Loader2,
    RefreshCw,
    Unplug,
} from 'lucide-react';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    applySpseStaging,
    fetchSpseStaging,
    fetchSpseStatus,
    promoteSpseStagingDraft,
    revokeSpseSession,
    saveSpseSession,
    triggerSpseSync,
} from '@/features/procurement-sync/api';
import { SpseDocumentImportDialog } from '@/features/procurement-sync/components/SpseDocumentImportDialog';
import { SpseStagingDetailDialog } from '@/features/procurement-sync/components/SpseStagingDetailDialog';
import {
    buildSpseBookmarkletHref,
    buildSpseCookieHeader,
    normalizeSpseSessionValueInput,
    readSpseSessionFromSearchParams,
    resolveSpseReturnUrl,
    SPSE_BOOKMARKLET_TITLE,
} from '@/features/procurement-sync/lib/spse-session';
import type { ProcurementStagingPaket, SpseSessionStatus } from '@/features/procurement-sync/types';
import { Route } from '@/routes/_authenticated/procurement-sync/index';
import { cn } from '@/lib/utils';

const SPSE_URL = 'https://spse.inaproc.id/cianjurkab';
const STAGING_PER_PAGE = 20;

function matchBadge(status: string) {
    if (status === 'unmatched') return <Badge variant="outline">Belum cocok</Badge>;
    if (status === 'manual_map') return <Badge variant="secondary">Manual</Badge>;
    return <Badge>Cocok</Badge>;
}

export default function SpseSyncPage() {
    const { tahunAnggaran } = useAppSettingsValues();
    const navigate = useNavigate({ from: Route.fullPath });
    const urlSearch = Route.useSearch();
    const [status, setStatus] = useState<SpseSessionStatus | null>(null);
    const [spseSessionValue, setSpseSessionValue] = useState('');
    const [staging, setStaging] = useState<ProcurementStagingPaket[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: STAGING_PER_PAGE,
        total: 0,
    });
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [importingSession, setImportingSession] = useState(false);
    const [manualOpen, setManualOpen] = useState(false);
    const [importRow, setImportRow] = useState<ProcurementStagingPaket | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [detailRow, setDetailRow] = useState<ProcurementStagingPaket | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    /** Prevent double-submit for the same bookmarklet payload */
    const lastImportedKey = useRef<string | null>(null);

    const connected = status?.connected && status?.is_active;

    const bookmarkletHref = useMemo(() => {
        if (typeof window === 'undefined') return '#';
        return buildSpseBookmarkletHref(resolveSpseReturnUrl(window.location.origin, '/procurement-sync'));
    }, []);

    const loadStatus = useCallback(async () => {
        try {
            const res = await fetchSpseStatus();
            setStatus(res);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal cek status SPSE');
        }
    }, []);

    const clearSessionQuery = useCallback(() => {
        void navigate({
            to: '/procurement-sync',
            search: {},
            replace: true,
        });
    }, [navigate]);

    const persistSession = useCallback(
        async (rawInput: string, successMessage: string) => {
            const cookieHeader = buildSpseCookieHeader(rawInput);
            if (!cookieHeader) {
                throw new Error('Nilai SPSE_SESSION kosong.');
            }
            await saveSpseSession({ cookie_header: cookieHeader, lpse_slug: 'cianjurkab' });
            toast.success(successMessage);
            setSpseSessionValue('');
            await loadStatus();
        },
        [loadStatus],
    );

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, tahunAnggaran]);

    const loadStaging = useCallback(async (pageOverride?: number) => {
        const activePage = pageOverride ?? page;
        setLoading(true);
        try {
            const res = await fetchSpseStaging({
                search: debouncedSearch || undefined,
                tahun: tahunAnggaran || undefined,
                page: activePage,
                per_page: STAGING_PER_PAGE,
            });
            setStaging(res.data);
            setPagination({
                current_page: res.current_page,
                last_page: res.last_page,
                per_page: res.per_page,
                total: res.total,
            });
            setSelected(new Set());
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal memuat staging');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, tahunAnggaran, page]);

    useEffect(() => {
        void loadStatus();
    }, [loadStatus]);

    useEffect(() => {
        if (connected) {
            void loadStaging();
        }
    }, [connected, loadStaging]);

    // Auto-import session from bookmarklet redirect (?spse_session= / ?spse_cookie=)
    useEffect(() => {
        const payload = readSpseSessionFromSearchParams(urlSearch);
        if (!payload) return;

        const importKey = `${payload.source}:${payload.input}`;
        if (lastImportedKey.current === importKey) return;
        lastImportedKey.current = importKey;

        let cancelled = false;

        void (async () => {
            setImportingSession(true);
            try {
                await persistSession(payload.input, 'Session SPSE dari bookmarklet tersimpan');
                if (!cancelled) clearSessionQuery();
            } catch (e) {
                if (!cancelled) {
                    toast.error(e instanceof Error ? e.message : 'Gagal simpan session dari bookmarklet');
                    clearSessionQuery();
                    setManualOpen(true);
                    setSpseSessionValue(normalizeSpseSessionValueInput(payload.input));
                }
            } finally {
                if (!cancelled) setImportingSession(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [urlSearch, persistSession, clearSessionQuery]);

    const matchedSelectable = useMemo(
        () => staging.filter((row) => row.match_status !== 'unmatched'),
        [staging],
    );

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelected(new Set(matchedSelectable.map((r) => r.id)));
        } else {
            setSelected(new Set());
        }
    };

    const toggleOne = (id: number, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const handleConnect = async () => {
        if (!spseSessionValue.trim()) {
            toast.error('Tempel nilai cookie SPSE_SESSION, atau gunakan bookmarklet.');
            return;
        }
        try {
            await persistSession(spseSessionValue, 'Session SPSE tersimpan');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal simpan session');
        }
    };

    const handleCopyBookmarklet = async () => {
        try {
            await navigator.clipboard.writeText(bookmarkletHref);
            toast.success('Bookmarklet disalin. Buat bookmark baru dan tempel ke URL-nya.');
        } catch {
            toast.error('Gagal menyalin. Seret tautan ke bookmark bar secara manual.');
        }
    };

    const handleBookmarkletClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        toast.message('Seret tautan ini ke bookmark bar browser — jangan diklik di sini.', {
            description: 'Lalu buka SPSE (login), klik bookmark "Kirim Session → Arumanis".',
        });
    };

    const handleDisconnect = async () => {
        try {
            await revokeSpseSession();
            toast.success('Session SPSE dihapus');
            setStaging([]);
            await loadStatus();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal hapus session');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await triggerSpseSync(100);
            if (res.run.item_count === 0 && res.run.error_log) {
                toast.error(res.run.error_log);
            } else {
                toast.success(`${res.message} (${res.run.item_count} paket)`);
            }
            setPage(1);
            await loadStaging(1);
            await loadStatus();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Sync gagal');
        } finally {
            setSyncing(false);
        }
    };

    const handleApply = async () => {
        const ids = [...selected];
        if (ids.length === 0) {
            toast.error('Pilih minimal satu baris yang sudah cocok');
            return;
        }
        try {
            const res = await applySpseStaging(ids, false);
            toast.success(res.message);
            await loadStaging();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Apply gagal');
        }
    };

    const handlePromoteDraft = async () => {
        const ids = [...selected];
        if (ids.length === 0) {
            toast.error('Pilih minimal satu baris staging');
            return;
        }
        try {
            const res = await promoteSpseStagingDraft(ids, { is_konsultan: true });
            toast.success(res.message);
            setSelected(new Set());
            await loadStaging();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Promote draft gagal');
        }
    };

    return (
        <PageContainer>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Sync SPSE Cianjur</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Login manual di SPSE (CAPTCHA), simpan session, lalu tarik daftar paket PPK ke Arumanis.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Session SPSE
                        </CardTitle>
                        <CardDescription>
                            Status: {status?.message ?? 'Memuat...'}
                            {status?.expires_at && (
                                <span className="block mt-1">Kadaluarsa: {status.expires_at}</span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {importingSession && (
                            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Menyimpan session dari bookmarklet…
                            </div>
                        )}

                        {!connected && !importingSession && (
                            <div className="space-y-4">
                                <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                                    <li>
                                        <strong className="font-medium text-foreground">Sekali saja:</strong> seret
                                        bookmarklet di bawah ke bookmark bar browser
                                    </li>
                                    <li>
                                        Buka{' '}
                                        <a href={SPSE_URL} target="_blank" rel="noreferrer" className="underline">
                                            SPSE Cianjur
                                        </a>{' '}
                                        → login + CAPTCHA
                                    </li>
                                    <li>
                                        Di tab SPSE, klik bookmark <strong className="text-foreground">{SPSE_BOOKMARKLET_TITLE}</strong>{' '}
                                        — session terkirim ke Arumanis otomatis
                                    </li>
                                </ol>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                                    <a
                                        href={bookmarkletHref}
                                        onClick={handleBookmarkletClick}
                                        title="Seret ke bookmark bar"
                                        className={cn(
                                            'inline-flex flex-1 cursor-grab items-center justify-center gap-2 rounded-lg border-2 border-dashed',
                                            'border-primary/40 bg-primary/5 px-4 py-3 text-sm font-medium text-primary',
                                            'transition-colors hover:border-primary hover:bg-primary/10 active:cursor-grabbing',
                                        )}
                                    >
                                        <BookmarkPlus className="h-4 w-4 shrink-0" />
                                        {SPSE_BOOKMARKLET_TITLE}
                                        <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
                                            (seret ke bookmark bar)
                                        </span>
                                    </a>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="sm:w-auto"
                                        onClick={() => void handleCopyBookmarklet()}
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Salin
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Bookmarklet hanya berjalan di domain SPSE. Pastikan Arumanis dibuka di browser yang
                                    sama (sudah login).
                                </p>

                                <Collapsible open={manualOpen} onOpenChange={setManualOpen}>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="px-0 text-muted-foreground">
                                            {manualOpen ? 'Sembunyikan' : 'Cadangan:'} tempel value manual (DevTools)
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="space-y-3 pt-2">
                                        <p className="text-xs text-muted-foreground">
                                            DevTools → Application → Cookies → <code className="text-[11px]">spse.inaproc.id</code>{' '}
                                            → salin kolom <strong>Value</strong> baris{' '}
                                            <code className="text-[11px]">SPSE_SESSION</code>.
                                        </p>
                                        <div className="space-y-2">
                                            <Label htmlFor="spse_session_value">Nilai session</Label>
                                            <div className="overflow-hidden rounded-md border bg-background">
                                                <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
                                                    <code className="text-xs font-medium text-muted-foreground">
                                                        SPSE_SESSION=
                                                    </code>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        template — isi value di bawah
                                                    </span>
                                                </div>
                                                <Textarea
                                                    id="spse_session_value"
                                                    value={spseSessionValue}
                                                    onChange={(e) =>
                                                        setSpseSessionValue(
                                                            normalizeSpseSessionValueInput(e.target.value),
                                                        )
                                                    }
                                                    onPaste={(e) => {
                                                        const text = e.clipboardData.getData('text')?.trim();
                                                        if (!text) return;
                                                        e.preventDefault();
                                                        setSpseSessionValue(
                                                            text.includes(';')
                                                                ? text
                                                                : normalizeSpseSessionValueInput(text),
                                                        );
                                                    }}
                                                    placeholder="temp|eyJhbGciOi...  (value cookie saja)"
                                                    className="min-h-[6rem] resize-y rounded-none border-0 font-mono text-xs shadow-none focus-visible:ring-0 sm:text-sm"
                                                    rows={4}
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={() => void handleConnect()}>Simpan session</Button>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        )}

                        {connected && (
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={() => void handleSync()} disabled={syncing}>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                                    Sync paket dari SPSE
                                </Button>
                                <Button variant="outline" onClick={() => void handleDisconnect()}>
                                    <Unplug className="mr-2 h-4 w-4" />
                                    Putuskan session
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {connected && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg">Preview staging</CardTitle>
                                <CardDescription>
                                    Centang baris: <strong>Apply</strong> mengisi kode_paket ke kontrak yang cocok;
                                    <strong> Promote Draft</strong> membuat draft pekerjaan + kontrak untuk paket belum cocok.
                                    Tahun: {tahunAnggaran}.
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <Input
                                    placeholder="Cari nama / kode paket"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-56"
                                />
                                <Button variant="outline" onClick={() => void loadStaging()} disabled={loading}>
                                    Refresh
                                </Button>
                                <Button onClick={handleApply} disabled={selected.size === 0}>
                                    Apply ({selected.size})
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => void handlePromoteDraft()}
                                    disabled={selected.size === 0}
                                    title="Buat draft pekerjaan + kontrak dari staging (cocok untuk unmatched)"
                                >
                                    Promote Draft ({selected.size})
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <Checkbox
                                                checked={
                                                    matchedSelectable.length > 0 &&
                                                    selected.size === matchedSelectable.length
                                                }
                                                onCheckedChange={(v) => toggleAll(Boolean(v))}
                                            />
                                        </TableHead>
                                        <TableHead>Kode paket</TableHead>
                                        <TableHead>Nama paket</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Metode</TableHead>
                                        <TableHead>Match</TableHead>
                                        <TableHead>Pekerjaan Arumanis</TableHead>
                                        <TableHead className="w-24">Dokumen</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staging.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                {loading ? 'Memuat...' : 'Belum ada data. Klik Sync paket dari SPSE.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {staging.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <Checkbox
                                                    disabled={row.match_status === 'unmatched'}
                                                    checked={selected.has(row.id)}
                                                    onCheckedChange={(v) => toggleOne(row.id, Boolean(v))}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{row.kode_paket}</TableCell>
                                            <TableCell className="max-w-md">
                                                <button
                                                    type="button"
                                                    className="text-left truncate w-full text-primary hover:underline font-medium"
                                                    title={row.nama_paket}
                                                    onClick={() => {
                                                        setDetailRow(row);
                                                        setDetailOpen(true);
                                                    }}
                                                >
                                                    {row.nama_paket}
                                                </button>
                                            </TableCell>
                                            <TableCell>{row.status_paket ?? '-'}</TableCell>
                                            <TableCell>{row.metode_pengadaan ?? row.jenis_paket ?? '-'}</TableCell>
                                            <TableCell>{matchBadge(row.match_status)}</TableCell>
                                            <TableCell className="text-sm">
                                                {row.pekerjaan?.nama_paket ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={row.match_status === 'unmatched' || !row.matched_pekerjaan_id}
                                                    onClick={() => {
                                                        setImportRow(row);
                                                        setImportOpen(true);
                                                    }}
                                                >
                                                    <FileDown className="h-4 w-4 mr-1" />
                                                    Import
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-4">
                                <p className="text-sm text-muted-foreground">
                                    {pagination.total > 0
                                        ? `Menampilkan ${staging.length} dari ${pagination.total} paket (tahun ${tahunAnggaran})`
                                        : `Tidak ada paket untuk tahun ${tahunAnggaran}`}
                                </p>
                                {pagination.last_page > 1 && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1 || loading}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Sebelumnya
                                        </Button>
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            Hal {pagination.current_page} / {pagination.last_page}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                                            disabled={page >= pagination.last_page || loading}
                                        >
                                            Berikutnya
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <SpseStagingDetailDialog
                    row={detailRow}
                    open={detailOpen}
                    onOpenChange={setDetailOpen}
                    onImportDocuments={(row) => {
                        setImportRow(row);
                        setImportOpen(true);
                    }}
                />

                <SpseDocumentImportDialog
                    row={importRow}
                    open={importOpen}
                    onOpenChange={setImportOpen}
                />
            </div>
        </PageContainer>
    );
}