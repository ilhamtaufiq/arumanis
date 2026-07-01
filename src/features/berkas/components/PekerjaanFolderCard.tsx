import type { PekerjaanFolder } from '@/features/berkas/lib/media-library-utils';
import { formatFolderLocation } from '@/features/berkas/lib/media-library-utils';
import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

type PekerjaanFolderCardProps = {
    folder: PekerjaanFolder;
    onOpen: () => void;
    variant?: 'grid' | 'list';
};

function formatRelativeDate(dateStr: string | null): string {
    if (!dateStr) return '-';

    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PekerjaanFolderCard({ folder, onOpen, variant = 'grid' }: PekerjaanFolderCardProps) {
    const { pekerjaan, totalItems, photoCount, docCount } = folder;

    if (variant === 'list') {
        return (
            <button
                type="button"
                onClick={onOpen}
                className={cn(
                    'group flex w-full items-center gap-4 p-4 text-left transition-colors',
                    'hover:bg-amber-50/60 dark:hover:bg-amber-950/20',
                )}
            >
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                    <Folder className="h-6 w-6 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium" title={pekerjaan.nama_paket}>
                        {pekerjaan.nama_paket}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                        {formatFolderLocation(pekerjaan)}
                        {' · '}
                        {photoCount} foto
                        {totalItems === 0 ? ' · belum ada file' : ''}
                    </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDate(folder.latestAt)}
                </span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onOpen}
            className={cn(
                'group flex w-full flex-col rounded-2xl border bg-card p-4 text-left transition-all',
                'hover:border-amber-500/40 hover:bg-amber-50/40 hover:shadow-md',
                'dark:hover:bg-amber-950/20',
            )}
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 transition-transform group-hover:scale-105 dark:bg-amber-900/40 dark:text-amber-300">
                    <Folder className="h-8 w-8 fill-current" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                    {formatRelativeDate(folder.latestAt)}
                </span>
            </div>

            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug" title={pekerjaan.nama_paket}>
                {pekerjaan.nama_paket}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {formatFolderLocation(pekerjaan)}
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <span>{photoCount} foto</span>
                {docCount > 0 ? (
                    <>
                        <span>·</span>
                        <span>{docCount} berkas</span>
                    </>
                ) : null}
                {totalItems > 0 ? (
                    <>
                        <span>·</span>
                        <span>{totalItems} file</span>
                    </>
                ) : (
                    <span>· belum ada file</span>
                )}
            </div>
        </button>
    );
}