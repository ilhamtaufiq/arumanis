import { Settings, Database, HardDrive, RefreshCw, Image, FileText, Server, Download, Upload, ArchiveRestore, PlusCircle, Trash2, Eraser, Cloud, CloudUpload, Unplug, XCircle } from 'lucide-react';
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
    cancelBackupJob,
    cancelGoogleDriveUploadJob,
    connectGoogleDrive,
    createBackup,
    deleteBackup,
    disconnectGoogleDrive,
    getBackupJob,
    getBackups,
    getGoogleDriveStatus,
    getGoogleDriveUploadJob,
    getStorageStats,
    restoreBackup,
    restoreBackupFromFile,
    triggerBackupDownload,
    uploadBackupToGoogleDrive,
    type BackupArchive,
    type BackupJob,
    type GoogleDriveStatus,
    type GoogleDriveUploadJob,
    type StorageStats,
} from '../api';

type PendingConfirmAction =
    | { type: 'restore'; filename: string }
    | { type: 'delete'; filename: string }
    | { type: 'restore-file' }
    | { type: 'disconnect-gdrive' }
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
    const [googleDrive, setGoogleDrive] = useState<GoogleDriveStatus | null>(null);
    const [isLoadingDrive, setIsLoadingDrive] = useState(false);
    const [isConnectingDrive, setIsConnectingDrive] = useState(false);
    const [isDisconnectingDrive, setIsDisconnectingDrive] = useState(false);
    const [uploadingToDrive, setUploadingToDrive] = useState<string | null>(null);
    const [activeDriveJob, setActiveDriveJob] = useState<GoogleDriveUploadJob | null>(null);
    const [isCancellingBackup, setIsCancellingBackup] = useState(false);
    const [isCancellingDriveUpload, setIsCancellingDriveUpload] = useState(false);
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

    const fetchGoogleDrive = useCallback(async () => {
        try {
            setIsLoadingDrive(true);
            const response = await getGoogleDriveStatus();
            setGoogleDrive(response.data);
        } catch (error) {
            console.error('Failed to fetch Google Drive status:', error);
            // Non-blocking: section shows disconnected/unavailable
            setGoogleDrive(null);
        } finally {
            setIsLoadingDrive(false);
        }
    }, []);

    const refreshAll = useCallback(() => {
        fetchStats();
        fetchBackups();
        fetchGoogleDrive();
    }, [fetchBackups, fetchGoogleDrive, fetchStats]);

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

    // Handle OAuth return from Google Drive connect flow
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const driveResult = params.get('google_drive');
        if (!driveResult) return;

        const message = params.get('google_drive_message');
        if (driveResult === 'connected') {
            toast.success('Google Drive terhubung. Folder "Arumanis Backups" siap dipakai.');
            void fetchGoogleDrive();
        } else if (driveResult === 'error') {
            toast.error(message || 'Gagal menghubungkan Google Drive');
        }

        params.delete('google_drive');
        params.delete('google_drive_message');
        const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', next);
    }, [fetchGoogleDrive]);

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

            if (response.data.status === 'cancelled') {
                return response.data;
            }
        }

        throw new Error(
            'Backup masih diproses di server (arsip besar bisa >1 jam). Tutup dialog ini dan cek daftar backup nanti — proses CLI tetap jalan di background.',
        );
    };

    const handleCancelBackupJob = async () => {
        if (!activeBackupJob?.job_id) return;

        try {
            setIsCancellingBackup(true);
            const response = await cancelBackupJob(activeBackupJob.job_id);
            setActiveBackupJob(response.data);

            if (response.data.status === 'cancelled') {
                toast.success('Backup dibatalkan');
                setIsCreatingBackup(false);
            } else {
                toast.info('Permintaan pembatalan backup dikirim');
            }
        } catch (error) {
            console.error('Failed to cancel backup job:', error);
            toast.error(getApiErrorMessage(error, 'Gagal membatalkan backup'));
        } finally {
            setIsCancellingBackup(false);
        }
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

            if (finishedJob.status === 'cancelled') {
                toast.info('Backup dibatalkan');
                return;
            }

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

    const handleConnectGoogleDrive = async () => {
        try {
            setIsConnectingDrive(true);
            const response = await connectGoogleDrive();
            if (!response.data?.url) {
                throw new Error('URL OAuth Google Drive tidak tersedia');
            }
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to start Google Drive connect:', error);
            toast.error(getApiErrorMessage(error, 'Gagal memulai koneksi Google Drive'));
            setIsConnectingDrive(false);
        }
    };

    const waitForDriveUploadJob = async (jobId: string, sizeBytes?: number) => {
        // Multi-GB upload can take a long time; poll generously when size is large.
        const large = (sizeBytes ?? 0) > 500 * 1024 * 1024;
        const maxAttempts = large ? 2880 : 720;
        const intervalMs = 2500;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
            const response = await getGoogleDriveUploadJob(jobId);
            setActiveDriveJob(response.data);

            if (response.data.status === 'completed') {
                return response.data;
            }
            if (response.data.status === 'failed') {
                throw new Error(response.data.error || response.data.message || 'Upload ke Google Drive gagal');
            }

            if (response.data.status === 'cancelled') {
                return response.data;
            }
        }

        throw new Error(
            'Upload masih berjalan di server (file besar bisa lama). Tutup notifikasi ini dan cek Google Drive nanti.',
        );
    };

    const handleCancelDriveUpload = async () => {
        if (!activeDriveJob?.job_id) return;

        try {
            setIsCancellingDriveUpload(true);
            const response = await cancelGoogleDriveUploadJob(activeDriveJob.job_id);
            setActiveDriveJob(response.data);

            if (response.data.status === 'cancelled') {
                toast.success('Upload ke Google Drive dibatalkan');
                setUploadingToDrive(null);
            } else {
                toast.info('Permintaan pembatalan upload dikirim');
            }
        } catch (error) {
            console.error('Failed to cancel Google Drive upload:', error);
            toast.error(getApiErrorMessage(error, 'Gagal membatalkan upload'));
        } finally {
            setIsCancellingDriveUpload(false);
        }
    };

    const handleUploadToGoogleDrive = async (filename: string, sizeBytes?: number) => {
        if (!googleDrive?.connected) {
            toast.error('Hubungkan Google Drive terlebih dahulu');
            return;
        }

        try {
            setUploadingToDrive(filename);
            const response = await uploadBackupToGoogleDrive(filename);
            setActiveDriveJob(response.data);
            toast.info(`Mengunggah ${filename} ke Google Drive…`);

            const finished = await waitForDriveUploadJob(response.data.job_id, sizeBytes);

            if (finished.status === 'cancelled') {
                toast.info('Upload ke Google Drive dibatalkan');
                return;
            }

            const link = finished.result?.webViewLink;
            if (link) {
                toast.success(
                    `Berhasil diunggah: ${finished.result?.name || filename}`,
                    {
                        action: {
                            label: 'Buka Drive',
                            onClick: () => window.open(link, '_blank', 'noopener,noreferrer'),
                        },
                    },
                );
            } else {
                toast.success(`Berhasil diunggah ke Google Drive: ${finished.result?.name || filename}`);
            }
        } catch (error) {
            console.error('Failed to upload backup to Google Drive:', error);
            toast.error(getApiErrorMessage(error, 'Gagal mengunggah ke Google Drive'));
        } finally {
            setUploadingToDrive(null);
            setActiveDriveJob(null);
        }
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

            if (pendingConfirm.type === 'disconnect-gdrive') {
                setIsDisconnectingDrive(true);
                const response = await disconnectGoogleDrive();
                setGoogleDrive(response.data);
                toast.success('Koneksi Google Drive diputus');
                setPendingConfirm(null);
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
            } else if (pendingConfirm.type === 'disconnect-gdrive') {
                toast.error(getApiErrorMessage(error, 'Gagal memutus Google Drive'));
            } else {
                toast.error(getApiErrorMessage(error, 'Gagal restore backup'));
            }
        } finally {
            setIsRestoringBackup(false);
            setDeletingBackup(null);
            setIsDisconnectingDrive(false);
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

        if (pendingConfirm.type === 'disconnect-gdrive') {
            return {
                title: 'Putus Google Drive?',
                desc: 'Token akses akan dihapus dari server. Backup yang sudah di Drive tetap ada; unggah baru memerlukan hubungkan ulang.',
                destructive: true,
                confirmText: 'Putus',
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
            isLoading={isRestoringBackup || deletingBackup !== null || isDisconnectingDrive}
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-primary" />
                        <h2 className="font-bold">Google Drive</h2>
                        {googleDrive?.connected ? (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">Terhubung</Badge>
                        ) : (
                            <Badge variant="secondary">Belum terhubung</Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {googleDrive?.connected ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={isDisconnectingDrive || isLoadingDrive}
                                onClick={() => setPendingConfirm({ type: 'disconnect-gdrive' })}
                            >
                                <Unplug className="h-4 w-4" />
                                Putus
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="gap-2"
                                disabled={isConnectingDrive || isLoadingDrive || googleDrive?.configured === false}
                                onClick={() => void handleConnectGoogleDrive()}
                            >
                                <Cloud className="h-4 w-4" />
                                {isConnectingDrive ? 'Membuka Google…' : 'Hubungkan Google Drive'}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            disabled={isLoadingDrive}
                            onClick={() => void fetchGoogleDrive()}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Admin menghubungkan akun Google sekali. Backup diunggah ke folder{' '}
                    <span className="font-medium text-foreground">{googleDrive?.folder_name || 'Arumanis Backups'}</span>
                    {' '}(scope drive.file — hanya file yang dibuat aplikasi).
                </p>
                {googleDrive?.configured === false && (
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                        Google OAuth belum dikonfigurasi di server (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).
                    </p>
                )}
                {googleDrive?.connected && googleDrive.email && (
                    <p className="mt-2 text-sm">
                        Akun: <span className="font-medium">{googleDrive.email}</span>
                        {googleDrive.connected_at
                            ? ` · sejak ${new Date(googleDrive.connected_at).toLocaleString('id-ID')}`
                            : ''}
                    </p>
                )}
                {activeDriveJob && (
                    <div className="mt-4 space-y-2 rounded-md border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="font-medium">
                                {activeDriveJob.message || 'Upload ke Drive'}: {activeDriveJob.filename}
                            </div>
                            {(activeDriveJob.status === 'queued' || activeDriveJob.status === 'running') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 border-sky-200 bg-white text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950 dark:hover:bg-sky-900"
                                    disabled={isCancellingDriveUpload}
                                    onClick={() => void handleCancelDriveUpload()}
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    {isCancellingDriveUpload ? 'Membatalkan…' : 'Batalkan'}
                                </Button>
                            )}
                        </div>
                        {typeof activeDriveJob.progress === 'number' ? (
                            <div className="space-y-1">
                                <div className="h-2 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900">
                                    <div
                                        className="h-full bg-sky-600 transition-all"
                                        style={{ width: `${Math.min(100, Math.max(0, activeDriveJob.progress))}%` }}
                                    />
                                </div>
                                <div className="text-xs opacity-80">{activeDriveJob.progress}%</div>
                            </div>
                        ) : null}
                        <div className="text-xs opacity-80">Status: {activeDriveJob.status}</div>
                    </div>
                )}
            </div>

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
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="font-medium">
                                {activeBackupJob.message || 'Backup sedang diproses'}: {activeBackupJob.filename}
                            </div>
                            {(activeBackupJob.status === 'queued' || activeBackupJob.status === 'running') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 border-blue-200 bg-white text-blue-800 hover:bg-blue-100"
                                    disabled={isCancellingBackup}
                                    onClick={() => void handleCancelBackupJob()}
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    {isCancellingBackup ? 'Membatalkan…' : 'Batalkan'}
                                </Button>
                            )}
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
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title={
                                                        googleDrive?.connected
                                                            ? 'Kirim ke Google Drive'
                                                            : 'Hubungkan Google Drive dulu'
                                                    }
                                                    disabled={
                                                        !googleDrive?.connected
                                                        || uploadingToDrive !== null
                                                        || isRestoringBackup
                                                    }
                                                    onClick={() => void handleUploadToGoogleDrive(backup.filename, backup.size)}
                                                >
                                                    <CloudUpload className={`h-4 w-4 ${uploadingToDrive === backup.filename ? 'animate-pulse' : ''}`} />
                                                </Button>
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
