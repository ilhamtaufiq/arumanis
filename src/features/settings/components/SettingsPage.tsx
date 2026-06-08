import { Settings, Database, HardDrive, RefreshCw, Image, FileText, Server, Download, Upload, ArchiveRestore, PlusCircle, Trash2 } from 'lucide-react';
import AppSettingsForm from './AppSettingsForm';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    createBackup,
    deleteBackup,
    downloadBackup,
    getBackupJob,
    getBackups,
    getStorageStats,
    restoreBackup,
    restoreBackupFromFile,
    type BackupArchive,
    type BackupJob,
    type StorageStats,
} from '../api';

export default function SettingsPage() {
    const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
    const [serverStats, setServerStats] = useState<StorageStats['data'] | null>(null);
    const [backups, setBackups] = useState<BackupArchive[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingBackups, setIsLoadingBackups] = useState(false);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [activeBackupJob, setActiveBackupJob] = useState<BackupJob | null>(null);
    const [deletingBackup, setDeletingBackup] = useState<string | null>(null);
    const [isRestoringBackup, setIsRestoringBackup] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);

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

    const waitForBackupJob = async (jobId: string) => {
        const maxAttempts = 240;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => window.setTimeout(resolve, 2500));
            const response = await getBackupJob(jobId);
            setActiveBackupJob(response.data);

            if (response.data.status === 'completed') {
                return response.data;
            }

            if (response.data.status === 'failed') {
                throw new Error(response.data.error || response.data.message || 'Backup gagal dibuat');
            }
        }

        throw new Error('Backup masih diproses terlalu lama. Cek kembali daftar backup beberapa menit lagi.');
    };

    const handleCreateBackup = async () => {
        try {
            setIsCreatingBackup(true);
            const response = await createBackup(true);
            setActiveBackupJob(response.data);
            toast.info('Backup sedang diproses di server');

            const finishedJob = await waitForBackupJob(response.data.job_id);
            toast.success(`Backup dibuat: ${finishedJob.result?.filename || finishedJob.filename}`);
            await fetchBackups();
        } catch (error) {
            console.error('Failed to create backup:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal membuat backup');
        } finally {
            setIsCreatingBackup(false);
            setActiveBackupJob(null);
        }
    };

    const handleDownloadBackup = async (filename: string) => {
        try {
            const blob = await downloadBackup(filename);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download backup:', error);
            toast.error('Gagal mengunduh backup');
        }
    };

    const handleRestoreBackup = async (filename: string) => {
        const confirmed = window.confirm(`Restore backup ${filename} akan mengganti database dan media. Lanjutkan?`);
        if (!confirmed) return;

        try {
            setIsRestoringBackup(true);
            await restoreBackup(filename);
            toast.success(`Restore dari ${filename} berhasil dijalankan`);
        } catch (error) {
            console.error('Failed to restore backup:', error);
            toast.error('Gagal restore backup');
        } finally {
            setIsRestoringBackup(false);
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        const confirmed = window.confirm(`Hapus backup ${filename}? File backup yang dihapus tidak bisa dikembalikan.`);
        if (!confirmed) return;

        try {
            setDeletingBackup(filename);
            await deleteBackup(filename);
            toast.success(`Backup ${filename} berhasil dihapus`);
            await fetchBackups();
        } catch (error) {
            console.error('Failed to delete backup:', error);
            toast.error('Gagal menghapus backup');
        } finally {
            setDeletingBackup(null);
        }
    };

    const handleRestoreFromFile = async () => {
        if (!restoreFile) {
            toast.error('Pilih file backup terlebih dahulu');
            return;
        }

        const confirmed = window.confirm('Restore backup akan mengganti database dan media saat ini. Lanjutkan?');
        if (!confirmed) return;

        try {
            setIsRestoringBackup(true);
            await restoreBackupFromFile(restoreFile);
            toast.success('Restore dari file backup berhasil dijalankan');
            setRestoreFile(null);
        } catch (error) {
            console.error('Failed to restore backup from file:', error);
            toast.error('Gagal restore dari file backup');
        } finally {
            setIsRestoringBackup(false);
        }
    };

    return (
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

            <div className="bg-card rounded-lg border p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <ArchiveRestore className="h-5 w-5 text-primary" />
                        <h2 className="font-bold">Backup & Restore</h2>
                    </div>
                    <Button onClick={handleCreateBackup} disabled={isCreatingBackup || isLoadingBackups} className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        {isCreatingBackup ? 'Membuat Backup...' : 'Buat Backup Terkompresi'}
                    </Button>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                    Backup mencakup database dan file media/berkas yang tersimpan. Proses berjalan di server agar tidak putus saat data besar.
                </p>

                {activeBackupJob && (
                    <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {activeBackupJob.message || 'Backup sedang diproses'}: {activeBackupJob.filename}
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
                                                <Button variant="outline" size="sm" onClick={() => handleDownloadBackup(backup.filename)}>
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
                                <span className="font-mono font-bold bg-primary/5 px-2 py-0.5 rounded text-xs">v1.2.4-stable</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <span className="text-muted-foreground">Environment</span>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">Production</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
