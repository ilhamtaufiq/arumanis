import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, FileDown, Link2, RefreshCw, Unplug } from 'lucide-react';
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
import type { ProcurementStagingPaket, SpseSessionStatus } from '@/features/procurement-sync/types';

const SPSE_URL = 'https://spse.inaproc.id/cianjurkab';
const STAGING_PER_PAGE = 20;

function matchBadge(status: string) {
    if (status === 'unmatched') return <Badge variant="outline">Belum cocok</Badge>;
    if (status === 'manual_map') return <Badge variant="secondary">Manual</Badge>;
    return <Badge>Cocok</Badge>;
}

export default function SpseSyncPage() {
    const { tahunAnggaran } = useAppSettingsValues();
    const [status, setStatus] = useState<SpseSessionStatus | null>(null);
    const [cookieHeader, setCookieHeader] = useState('');
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
    const [importRow, setImportRow] = useState<ProcurementStagingPaket | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [detailRow, setDetailRow] = useState<ProcurementStagingPaket | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const connected = status?.connected && status?.is_active;

    const loadStatus = useCallback(async () => {
        try {
            const res = await fetchSpseStatus();
            setStatus(res);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal cek status SPSE');
        }
    }, []);

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
        if (!cookieHeader.trim()) {
            toast.error('Paste cookie dari DevTools (document.cookie) setelah login SPSE.');
            return;
        }
        try {
            await saveSpseSession({ cookie_header: cookieHeader.trim(), lpse_slug: 'cianjurkab' });
            toast.success('Session SPSE tersimpan');
            setCookieHeader('');
            await loadStatus();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal simpan session');
        }
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
                        {!connected && (
                            <div className="space-y-3">
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>
                                        Buka{' '}
                                        <a href={SPSE_URL} target="_blank" rel="noreferrer" className="underline">
                                            {SPSE_URL}
                                        </a>{' '}
                                        dan login + CAPTCHA
                                    </li>
                                    <li>
                                        DevTools → Application → Cookies → <code className="text-xs">spse.inaproc.id</code>
                                    </li>
                                    <li>
                                        Copy semua cookie (wajib ada <code className="text-xs">SPSE_SESSION</code>), atau paste dari
                                        Console jika lengkap
                                    </li>
                                </ol>
                                <div className="space-y-2">
                                    <Label htmlFor="cookie_header">Cookie header</Label>
                                    <Textarea
                                        id="cookie_header"
                                        value={cookieHeader}
                                        onChange={(e) => setCookieHeader(e.target.value)}
                                        placeholder="SPSE_SESSION=...; XSRF-TOKEN=..."
                                        rows={4}
                                    />
                                </div>
                                <Button onClick={handleConnect}>Simpan session</Button>
                            </div>
                        )}
                        {connected && (
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={handleSync} disabled={syncing}>
                                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                                    Sync paket dari SPSE
                                </Button>
                                <Button variant="outline" onClick={handleDisconnect}>
                                    <Unplug className="h-4 w-4 mr-2" />
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