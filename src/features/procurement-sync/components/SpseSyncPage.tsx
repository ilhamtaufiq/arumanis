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
    fetchSpseSyncRuns,
    promoteSpseStagingDraft,
    revokeSpseSession,
    saveSpseSession,
    triggerSpseSync,
} from '@/features/procurement-sync/api';
import { SpseDocumentImportDialog } from '@/features/procurement-sync/components/SpseDocumentImportDialog';
import { SpseManualMapDialog } from '@/features/procurement-sync/components/SpseManualMapDialog';
import { SpseStagingDetailDialog } from '@/features/procurement-sync/components/SpseStagingDetailDialog';
import {
    buildSpseBookmarkletHref,
    buildSpseCookieHeader,
    normalizeSpseSessionValueInput,
    readSpseSessionFromSearchParams,
    resolveSpseReturnUrl,
    SPSE_BOOKMARKLET_TITLE,
} from '@/features/procurement-sync/lib/spse-session';
import type { ProcurementStagingPaket, ProcurementSyncRun, SpseSessionStatus } from '@/features/procurement-sync/types';
import { Route } from '@/routes/_authenticated/procurement-sync/index';
import { cn } from '@/lib/utils';

const SPSE_URL = 'https://spse.inaproc.id/cianjurkab';
const STAGING_PER_PAGE = 20;

function matchBadge(status: string) {
    if (status === 'unmatched') return <Badge variant="outline">Belum cocok</Badge>;
    if (status === 'manual_map') return <Badge variant="secondary">Manual</Badge>;
    if (status === 'promoted_draft') return <Badge variant="secondary">Draft</Badge>;
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
    const [matchFilter, setMatchFilter] = useState('');
    const [syncRuns, setSyncRuns] = useState<ProcurementSyncRun[]>([]);
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
    const [mapRow, setMapRow] = useState<ProcurementStagingPaket | null>(null);
    const [mapOpen, setMapOpen] = useState(false);
    const [detailRow, setDetailRow] = useState<ProcurementStagingPaket | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    /** Prevent double-submit for the same bookmarklet payload */
    const lastImportedKey = useRef<string | null>(null);

    const connected = status?.connected && status?.is_active;

    const bookmarkletHref = useMemo(() => {
        if (typeof window === 'undefined') return '#';
        return buildSpseBookmarkletHref(resolveSpseReturnUrl(window.location.origin, '/procurement-sync'));
    }, []);

    /**
     * React 19 memblokir href="javascript:..." via sanitizeURL
     * (diganti jadi javascript:throw ...) sehingga drag-to-bookmark-bar
     * harus set atribut langsung ke DOM. Tanpa ini bookmark hasil seret
     * tidak melakukan apa-apa saat diklik.
     */
    const bookmarkletRef = useCallback(
        (el: HTMLAnchorElement | null) => {
            if (el && bookmarkletHref !== '#') {
                el.setAttribute('href', bookmarkletHref);
            }
        },
        [bookmarkletHref],
    );

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
    }, [debouncedSearch, tahunAnggaran, matchFilter]);

    const loadStaging = useCallback(async (pageOverride?: number) => {
        const activePage = pageOverride ?? page;
        setLoading(true);
        try {
            const res = await fetchSpseStaging({
                search: debouncedSearch || undefined,
                match_status: matchFilter || undefined,
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
    }, [debouncedSearch, matchFilter, tahunAnggaran, page]);

    const loadSyncRuns = useCallback(async () => {
        try {
            const res = await fetchSpseSyncRuns();
            setSyncRuns(res.data);
        } catch {
            // Riwayat sync opsional — tabel staging tetap utama
        }
    }, []);

    useEffect(() => {
        void loadStatus();
    }, [loadStatus]);

    useEffect(() => {
        if (connected) {
            void loadStaging();
            void loadSyncRuns();
        }
    }, [connected, loadStaging, loadSyncRuns]);

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

    // Bookmarklet fallback: SPSE_SESSION tak terbaca dari JS (umumnya HttpOnly).
    // Buka panduan tempel manual + jelaskan penyebabnya.
    useEffect(() => {
        const flag = urlSearch.spse_diagnose;
        if (flag === undefined) return;
        if (lastImportedKey.current === `diagnose:${flag}`) return;
        lastImportedKey.current = `diagnose:${flag}`;

        const visible = flag
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        toast.warning(
            visible.length > 0
                ? `SPSE_SESSION tak terbaca JS; cookie terbaca: ${visible.join(', ')}. Kemungkinan SPSE_SESSION HttpOnly — salin manual via DevTools.`
                : 'SPSE_SESSION tak terbaca JS sama sekali (kemungkinan HttpOnly) — salin manual via DevTools.',
            { duration: 10000 },
        );
        setManualOpen(true);
        clearSessionQuery();
    }, [urlSearch, clearSessionQuery]);

    const matchedIds = useMemo(
        () => staging.filter((row) => row.match_status !== 'unmatched').map((r) => r.id),
        [staging],
    );
    const unmatchedIds = useMemo(
        () => staging.filter((row) => row.match_status === 'unmatched').map((r) => r.id),
        [staging],
    );

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelected(new Set(staging.map((r) => r.id)));
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
            await loadSyncRuns();
            await loadStatus();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Sync gagal');
        } finally {
            setSyncing(false);
        }
    };

    const handleApply = async () => {
        const ids = [...selected].filter((id) => matchedIds.includes(id));
        if (ids.length === 0) {
            toast.error('Pilih minimal satu baris yang sudah cocok (Apply lewati yang belum cocok)');
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
        const ids = [...selected].filter((id) => unmatchedIds.includes(id));
        if (ids.length === 0) {
            toast.error('Pilih minimal satu baris yang belum cocok untuk Promote Draft');
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
                                        ref={bookmarkletRef}
                                        href="#spse-bookmarklet"
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
                                <select
                                    value={matchFilter}
                                    onChange={(e) => setMatchFilter(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                    title="Filter status match"
                                >
                                    <option value="">Semua status</option>
                                    <option value="unmatched">Belum cocok</option>
                                    <option value="exact_kode_paket">Cocok (kode)</option>
                                    <option value="fuzzy_nama_paket">Cocok (nama)</option>
                                    <option value="manual_map">Manual</option>
                                    <option value="promoted_draft">Draft</option>
                                </select>
                                <Button variant="outline" onClick={() => void loadStaging()} disabled={loading}>
                                    Refresh
                                </Button>
                                <Button onClick={handleApply} disabled={selected.size === 0}>
                                    Apply ({[...selected].filter((id) => matchedIds.includes(id)).length})
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => void handlePromoteDraft()}
                                    disabled={selected.size === 0}
                                    title="Buat draft pekerjaan + kontrak dari staging yang belum cocok"
                                >
                                    Promote Draft ({[...selected].filter((id) => unmatchedIds.includes(id)).length})
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
                                                    staging.length > 0 &&
                                                    selected.size === staging.length
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
                                        <TableHead className="w-40">Aksi</TableHead>
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
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setMapRow(row);
                                                            setMapOpen(true);
                                                        }}
                                                        title="Map manual ke pekerjaan Arumanis"
                                                    >
                                                        Map
                                                    </Button>
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
                                                </div>
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

                {connected && syncRuns.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Riwayat sync</CardTitle>
                            <CardDescription>
                                20 sync terakhir milik Anda. Error sync dengan 0 paket tampil di sini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Paket</TableHead>
                                        <TableHead>Cocok</TableHead>
                                        <TableHead>Selesai</TableHead>
                                        <TableHead>Error</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {syncRuns.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-mono text-xs">#{run.id}</TableCell>
                                            <TableCell>{run.status}</TableCell>
                                            <TableCell>{run.item_count}</TableCell>
                                            <TableCell>{run.matched_count}</TableCell>
                                            <TableCell className="text-xs">
                                                {run.finished_at
                                                    ? new Date(run.finished_at).toLocaleString('id-ID')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-xs text-destructive max-w-xs truncate" title={run.error_log ?? ''}>
                                                {run.error_log ?? '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <SpseManualMapDialog
                    row={mapRow}
                    open={mapOpen}
                    onOpenChange={setMapOpen}
                    onMapped={() => void loadStaging()}
                />

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