import { Settings, Database, HardDrive, RefreshCw, Image, FileText, Server, Download, Upload, ArchiveRestore, PlusCircle, Trash2, Eraser } from 'lucide-react';
import AppSettingsForm from './AppSettingsForm';
import { SettingsSubNav } from './SettingsSubNav';
import { useState, useEffect, useCallback } from 'react';
import { getEmbeddedBuildInfo, hardReloadApp } from '@/lib/app-cache';
import { ApiError } from '@/lib/api-client';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    createBackup,
    deleteBackup,
    getBackupJob,
    getBackups,
    getStorageStats,
    restoreBackup,
    restoreBackupFromFile,
    triggerBackupDownload,
    type BackupArchive,
    type BackupJob,
    type StorageStats,
} from '../api';

type PendingConfirmAction =
    | { type: 'restore'; filename: string }
    | { type: 'delete'; filename: string }
    | { type: 'restore-file' }
    | null;

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        const data = error.data as { message?: string; error?: string } | undefined;
        return data?.message || data?.error || error.message || fallback;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

export default function SettingsPage() {
    const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
    const [serverStats, setServerStats] = useState<StorageStats['data'] | null>(null);
    const [backups, setBackups] = useState<BackupArchive[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingBackups, setIsLoadingBackups] = useState(false);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [includeMediaInBackup, setIncludeMediaInBackup] = useState(true);
    const [activeBackupJob, setActiveBackupJob] = useState<BackupJob | null>(null);
    const [deletingBackup, setDeletingBackup] = useState<string | null>(null);
    const [isRestoringBackup, setIsRestoringBackup] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isClearingCache, setIsClearingCache] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmAction>(null);
    const embeddedBuild = getEmbeddedBuildInfo();

    const fetchStats = useCallback(async () => {
        try {
            setIsLoadingStats(true);
            const stats = await getStorageStats();
            setServerStats(stats.data);
        } catch (error) {
            console.error('Failed to fetch server stats:', error);
            toast.error('Gagal mengambil statistik penyimpanan server');
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    const fetchBackups = useCallback(async () => {
        try {
            setIsLoadingBackups(true);
            const response = await getBackups();
            setBackups(response.data);
        } catch (error) {
            console.error('Failed to fetch backups:', error);
            toast.error('Gagal mengambil daftar backup');
        } finally {
            setIsLoadingBackups(false);
        }
    }, []);

    const refreshAll = useCallback(() => {
        fetchStats();
        fetchBackups();
    }, [fetchBackups, fetchStats]);

    useEffect(() => {
        refreshAll();

        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                setStorageInfo({
                    usage: estimate.usage || 0,
                    quota: estimate.quota || 0
                });
            });
        }
    }, [refreshAll]);

    const formatBytes = (bytes: number | null | undefined) => {
        if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const waitForBackupJob = async (jobId: string, includeMedia: boolean) => {
        // Multi-GB media packaging can take hours; poll longer when media is included.
        // 2.5s interval × 2880 ≈ 2 jam (media), × 480 ≈ 20 menit (DB only).
        const maxAttempts = includeMedia ? 2880 : 480;
        const intervalMs = 2500;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => window.setTimeout(resolve, intervalMs));
            const response = await getBackupJob(jobId);
            setActiveBackupJob(response.data);

            if (response.data.status === 'completed') {
                return response.data;
            }

            if (response.data.status === 'failed') {
                throw new Error(response.data.error || response.data.message || 'Backup gagal dibuat');
            }
        }

        throw new Error(
            'Backup masih diproses di server (arsip besar bisa >1 jam). Tutup dialog ini dan cek daftar backup nanti — proses CLI tetap jalan di background.',
        );
    };

    const handleCreateBackup = async () => {
        try {
            setIsCreatingBackup(true);
            const response = await createBackup(includeMediaInBackup);
            setActiveBackupJob(response.data);
            toast.info(
                includeMediaInBackup
                    ? 'Backup + media dimulai di proses server (bisa multi-GB / lama).'
                    : 'Backup database saja dimulai di server.',
            );

            const finishedJob = await waitForBackupJob(response.data.job_id, includeMediaInBackup);
            const sizeLabel = finishedJob.result?.size != null ? formatBytes(finishedJob.result.size) : null;
            toast.success(
                sizeLabel
                    ? `Backup siap: ${finishedJob.result?.filename || finishedJob.filename} (${sizeLabel})`
                    : `Backup dibuat: ${finishedJob.result?.filename || finishedJob.filename}`,
            );
            await fetchBackups();
        } catch (error) {
            console.error('Failed to create backup:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal membuat backup');
            // Keep list fresh — job may still finish in background after poll timeout.
            await fetchBackups();
        } finally {
            setIsCreatingBackup(false);
            setActiveBackupJob(null);
        }
    };

    const handleDownloadBackup = (filename: string, sizeBytes?: number) => {
        // Multi-GB archives must stream to disk via the browser download manager.
        // fetch()+blob() loads the entire zip into RAM and fails around 3GB+.
        const sizeLabel = sizeBytes != null && sizeBytes > 0 ? formatBytes(sizeBytes) : null
        toast.message(
            sizeLabel
                ? `Mengunduh ${filename} (${sizeLabel}). File besar di-stream ke disk — pantau progress di unduhan browser.`
                : `Mengunduh ${filename}. File besar di-stream ke disk — pantau progress di unduhan browser.`,
        )
        triggerBackupDownload(filename)
    };

    const handleRestoreBackup = (filename: string) => {
        setPendingConfirm({ type: 'restore', filename });
    };

    const handleDeleteBackup = (filename: string) => {
        setPendingConfirm({ type: 'delete', filename });
    };

    const runPendingConfirm = async () => {
        if (!pendingConfirm) return;

        try {
            if (pendingConfirm.type === 'restore') {
                setIsRestoringBackup(true);
                await restoreBackup(pendingConfirm.filename);
                toast.success(`Restore dari ${pendingConfirm.filename} berhasil. Memuat ulang aplikasi...`);
                setPendingConfirm(null);
                await hardReloadApp({ force: true });
                return;
            }

            if (pendingConfirm.type === 'restore-file') {
                if (!restoreFile) {
                    toast.error('Pilih file backup terlebih dahulu');
                    return;
                }

                setIsRestoringBackup(true);
                await restoreBackupFromFile(restoreFile);
                toast.success('Restore dari file backup berhasil. Memuat ulang aplikasi...');
                setRestoreFile(null);
                setPendingConfirm(null);
                await hardReloadApp({ force: true });
                return;
            }

            setDeletingBackup(pendingConfirm.filename);
            await deleteBackup(pendingConfirm.filename);
            toast.success(`Backup ${pendingConfirm.filename} berhasil dihapus`);
            await fetchBackups();
            setPendingConfirm(null);
        } catch (error) {
            console.error('Backup action failed:', error);
            if (pendingConfirm.type === 'delete') {
                toast.error(getApiErrorMessage(error, 'Gagal menghapus backup'));
            } else {
                toast.error(getApiErrorMessage(error, 'Gagal restore backup'));
            }
        } finally {
            setIsRestoringBackup(false);
            setDeletingBackup(null);
        }
    };

    const handleClearCache = async () => {
        try {
            setIsClearingCache(true);
            await hardReloadApp({ force: true });
        } catch (error) {
            console.error('Failed to clear cache:', error);
            toast.error('Gagal membersihkan cache aplikasi');
            setIsClearingCache(false);
        }
    };

    const handleRestoreFromFile = () => {
        if (!restoreFile) {
            toast.error('Pilih file backup terlebih dahulu');
            return;
        }

        // PHP/container upload_max is 50M — multi-GB zips cannot go through browser upload.
        const maxUploadBytes = 50 * 1024 * 1024;
        if (restoreFile.size > maxUploadBytes) {
            toast.error(
                `File ${formatBytes(restoreFile.size)} melebihi batas upload (${formatBytes(maxUploadBytes)}). ` +
                    'Untuk backup besar, letakkan arsip di server lalu restore dari daftar backup tersimpan.',
            );
            return;
        }

        setPendingConfirm({ type: 'restore-file' });
    };

    const confirmDialogContent = (() => {
        if (!pendingConfirm) {
            return { title: '', desc: '', destructive: false, confirmText: 'Lanjut' };
        }

        if (pendingConfirm.type === 'restore') {
            const row = backups.find((b) => b.filename === pendingConfirm.filename);
            const sizeHint = row?.size ? ` (${formatBytes(row.size)})` : '';
            return {
                title: 'Restore backup?',
                desc: `Restore ${pendingConfirm.filename}${sizeHint} akan mengganti database dan media. Arsip multi-GB bisa memakan waktu lama di server. Aplikasi akan dimuat ulang setelah selesai.`,
                destructive: true,
                confirmText: 'Restore',
            };
        }

        if (pendingConfirm.type === 'restore-file') {
            return {
                title: 'Restore dari file?',
                desc: 'Restore backup akan mengganti database dan media saat ini. Hanya file ≤50 MB lewat upload browser. Aplikasi akan dimuat ulang setelah selesai.',
                destructive: true,
                confirmText: 'Restore',
            };
        }

        return {
            title: 'Hapus backup?',
            desc: `Hapus ${pendingConfirm.filename}? File backup yang dihapus tidak bisa dikembalikan.`,
            destructive: true,
            confirmText: 'Hapus',
        };
    })();

    return (
        <>
        <ConfirmDialog
            open={pendingConfirm !== null}
            onOpenChange={(open) => {
                if (!open && !isRestoringBackup && deletingBackup === null) {
                    setPendingConfirm(null);
                }
            }}
            title={confirmDialogContent.title}
            desc={confirmDialogContent.desc}
            destructive={confirmDialogContent.destructive}
            confirmText={confirmDialogContent.confirmText}
            handleConfirm={runPendingConfirm}
            isLoading={isRestoringBackup || deletingBackup !== null}
        />
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Settings className="h-8 w-8" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Aplikasi</h1>
                        <p className="text-muted-foreground">Kelola konfigurasi sistem dan parameter global aplikasi</p>
                    </div>
                </div>
            </div>

            <SettingsSubNav />

            <div className="bg-card rounded-lg border p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                        <ArchiveRestore className="h-5 w-5 text-primary" />
                        <h2 className="font-bold">Backup & Restore</h2>
                    </div>
                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border"
                                checked={includeMediaInBackup}
                                disabled={isCreatingBackup}
                                onChange={(e) => setIncludeMediaInBackup(e.target.checked)}
                            />
                            <span className="text-muted-foreground">
                                Sertakan media/berkas
                                {includeMediaInBackup ? ' (bisa multi-GB)' : ' — database saja'}
                            </span>
                        </label>
                        <Button onClick={handleCreateBackup} disabled={isCreatingBackup || isLoadingBackups} className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            {isCreatingBackup ? 'Membuat Backup...' : 'Buat Backup'}
                        </Button>
                    </div>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                    Backup dijalankan di proses CLI server (bukan di browser). Arsip + media multi-GB aman untuk dibuat; unduh memakai stream ke disk.
                    Restore upload browser max 50&nbsp;MB — untuk arsip besar, restore dari daftar backup di server.
                </p>

                {activeBackupJob && (
                    <div className="mt-4 space-y-2 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <div className="font-medium">
                            {activeBackupJob.message || 'Backup sedang diproses'}: {activeBackupJob.filename}
                        </div>
                        {typeof activeBackupJob.progress === 'number' ? (
                            <div className="space-y-1">
                                <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{ width: `${Math.min(100, Math.max(0, activeBackupJob.progress))}%` }}
                                    />
                                </div>
                                <div className="text-xs text-blue-700">{activeBackupJob.progress}%</div>
                            </div>
                        ) : null}
                        <div className="text-xs text-blue-700/80">
                            Status: {activeBackupJob.status}
                            {activeBackupJob.include_media ? ' · termasuk media' : ' · database saja'}
                        </div>
                    </div>
                )}

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Restore dari file backup</h3>
                        </div>
                        <Input
                            type="file"
                            accept=".zip"
                            onChange={(event) => setRestoreFile(event.target.files?.[0] || null)}
                        />
                        <Button
                            variant="outline"
                            onClick={handleRestoreFromFile}
                            disabled={!restoreFile || isRestoringBackup}
                            className="gap-2"
                        >
                            <ArchiveRestore className="h-4 w-4" />
                            {isRestoringBackup ? 'Merestore...' : 'Restore File'}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold">Backup tersimpan</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={fetchBackups} disabled={isLoadingBackups} className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                                Muat ulang
                            </Button>
                        </div>

                        <div className="max-h-80 overflow-auto rounded-lg border">
                            {backups.length === 0 ? (
                                <div className="p-4 text-sm text-muted-foreground">
                                    {isLoadingBackups ? 'Memuat backup...' : 'Belum ada backup tersimpan.'}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {backups.map((backup) => (
                                        <div key={backup.filename} className="flex items-center justify-between gap-3 p-3">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">{backup.filename}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatBytes(backup.size)}{backup.last_modified ? ` • ${new Date(backup.last_modified * 1000).toLocaleString('id-ID')}` : ''}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title={backup.size > 1_000_000_000 ? `Unduh ${formatBytes(backup.size)} (stream ke disk)` : 'Unduh backup'}
                                                    onClick={() => handleDownloadBackup(backup.filename, backup.size)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteBackup(backup.filename)}
                                                    disabled={deletingBackup === backup.filename || isRestoringBackup}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRestoreBackup(backup.filename)}
                                                    disabled={isRestoringBackup}
                                                >
                                                    Restore
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <AppSettingsForm />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <HardDrive className="h-5 w-5 text-primary" />
                            <h2 className="font-bold">Penyimpanan Browser</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                                <p className="text-xs text-muted-foreground mb-1">Data Terpakai</p>
                                <p className="text-xl font-mono font-bold">
                                    {storageInfo ? formatBytes(storageInfo.usage) : 'Menghitung...'}
                                </p>
                                {storageInfo && (
                                    <div className="mt-2 w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-primary h-full transition-all duration-500" 
                                            style={{ width: `${Math.min((storageInfo.usage / storageInfo.quota) * 100, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Eraser className="h-5 w-5 text-primary" />
                            <h2 className="font-bold">Cache Aplikasi</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Gunakan ini jika halaman tampil blank putih setelah deploy build terbaru.
                        </p>
                        <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                            <div className="flex justify-between gap-3">
                                <span>Versi</span>
                                <span className="font-mono font-semibold text-foreground">v{embeddedBuild.version}</span>
                            </div>
                            <div className="mt-2 flex justify-between gap-3">
                                <span>Build ID</span>
                                <span className="truncate font-mono font-semibold text-foreground">{embeddedBuild.buildId}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="mt-4 w-full gap-2"
                            onClick={handleClearCache}
                            disabled={isClearingCache}
                        >
                            <RefreshCw className={`h-4 w-4 ${isClearingCache ? 'animate-spin' : ''}`} />
                            {isClearingCache ? 'Membersihkan cache...' : 'Bersihkan Cache & Muat Ulang'}
                        </Button>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                <h2 className="font-bold">Penyimpanan Server</h2>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={fetchStats} 
                                disabled={isLoadingStats}
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-primary/10 rounded">
                                            <Image className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">Foto & Media</span>
                                    </div>
                                    <span className="font-mono font-bold">{serverStats ? formatBytes(serverStats.foto) : '...'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-primary/10 rounded">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">Berkas & Dokumen</span>
                                    </div>
                                    <span className="font-mono font-bold">{serverStats ? formatBytes(serverStats.berkas) : '...'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-primary/10 rounded">
                                            <Database className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">Database Sistem</span>
                                    </div>
                                    <span className="font-mono font-bold">{serverStats ? formatBytes(serverStats.database) : '...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm bg-linear-to-br from-card to-muted/30">
                        <div className="flex items-center gap-2 mb-4">
                            <Server className="h-5 w-5 text-primary" />
                            <h2 className="font-bold">Info Aplikasi</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <span className="text-muted-foreground">Versi App</span>
                                <span className="font-mono font-bold bg-primary/5 px-2 py-0.5 rounded text-xs">v{embeddedBuild.version}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <span className="text-muted-foreground">Build ID</span>
                                <span className="max-w-[140px] truncate font-mono text-[10px] font-bold">{embeddedBuild.buildId}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <span className="text-muted-foreground">Environment</span>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                                    {import.meta.env.PROD ? 'Production' : 'Development'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
