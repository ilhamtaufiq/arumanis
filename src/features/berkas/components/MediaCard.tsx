import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Image as ImageIcon,
    Video,
    File,
    Download,
    Trash2,
    MoreVertical,
    MapPin,
    Briefcase,
    User,
    Eye,
    CheckSquare,
    Square,
    Pencil,
    Share2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getFileExtension } from '@/lib/file-preview';
import { useFileInfo } from '../hooks/useFileInfo';

export type MediaSource = 'pekerjaan' | 'puspen' | 'user';

export interface MediaItem {
    id: number | string;
    source?: MediaSource;
    type: 'image' | 'document';
    name: string;
    url: string;
    media_id?: number | null;
    pekerjaan_id?: number;
    pekerjaan_name?: string;
    created_at: string;
    progress?: string;
    koordinat?: string;
    komponen?: string;
    jenis_dokumen?: string;
    /** Ukuran file dalam byte (dari API / fetch) */
    size?: number | null;
    /** Jumlah halaman PDF (di-load async dari URL) */
    page_count?: number | null;
    /** Pemilik bisa rename/hapus; false = item dishare (read-only) */
    can_manage?: boolean;
    /** Nama pemilik (admin melihat drive user lain) */
    owner_name?: string;
}

interface MediaCardProps {
    item: MediaItem;
    onClick?: (item: MediaItem) => void;
    onDelete?: (item: MediaItem) => void;
    onRename?: (item: MediaItem) => void;
    onShare?: (item: MediaItem) => void;
    showPekerjaan?: boolean;
    compact?: boolean;
    selectable?: boolean;
    selected?: boolean;
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getFileIcon(type: 'image' | 'document', url: string) {
    if (type === 'image') return ImageIcon;

    const ext = getFileExtension(url);
    if (ext === 'pdf') return FileText;
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return Video;
    return File;
}

export function formatFileSize(bytes: number | null | undefined): string {
    if (bytes == null || Number.isNaN(Number(bytes)) || bytes <= 0) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    let n = Number(bytes)
    let i = 0
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024
        i++
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function getBadgeClass(ext: string): string {
    const map: Record<string, string> = {
        jpg: 'bg-blue-600',
        jpeg: 'bg-blue-600',
        png: 'bg-emerald-600',
        gif: 'bg-violet-600',
        pdf: 'bg-red-600',
        doc: 'bg-blue-700',
        docx: 'bg-blue-700',
        xls: 'bg-emerald-700',
        xlsx: 'bg-emerald-700',
        mp4: 'bg-orange-600',
    };
    return map[ext] ?? 'bg-muted-foreground';
}

export default function MediaCard({
    item,
    onClick,
    onDelete,
    onRename,
    onShare,
    showPekerjaan = true,
    compact = false,
    selectable = false,
    selected = false,
}: MediaCardProps) {
    const ext = getFileExtension(item.url || item.name).toUpperCase() || 'FILE';
    const FileIcon = getFileIcon(item.type, item.url || item.name);
    const isImage = item.type === 'image' || ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'BMP', 'AVIF'].includes(ext);
    const { pageCount } = useFileInfo(item.url, ext.toLowerCase(), item.size);
    const sizeLabel = formatFileSize(item.size);

    return (
        <div className={cn(
            'group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/40 hover:shadow-md',
            selectable && 'cursor-pointer',
            selectable && selected && 'border-primary ring-2 ring-primary/40',
        )}>
            {selectable ? (
                <div className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-md border bg-background/90 shadow-sm backdrop-blur-sm">
                    {selected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                </div>
            ) : null}
            <div className="absolute right-2 top-2 z-20 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-background/90 backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onClick?.(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Pratinjau
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}>
                            <Download className="mr-2 h-4 w-4" />
                            Unduh
                        </DropdownMenuItem>
                        {item.can_manage !== false && onRename ? (
                            <DropdownMenuItem onClick={() => onRename(item)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Ganti Nama
                            </DropdownMenuItem>
                        ) : null}
                        {item.can_manage !== false && onShare ? (
                            <DropdownMenuItem onClick={() => onShare(item)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Bagikan
                            </DropdownMenuItem>
                        ) : null}
                        {item.can_manage !== false && onDelete ? (
                            <DropdownMenuItem
                                onClick={() => onDelete(item)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <button
                type="button"
                onClick={() => onClick?.(item)}
                className="relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden bg-muted"
            >
                {isImage ? (
                    <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileIcon className="h-14 w-14 opacity-70" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">{ext}</span>
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <Eye className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <Badge className={cn('absolute bottom-2 left-2 border-0 text-[10px] text-white', getBadgeClass(ext.toLowerCase()))}>
                    {isImage ? 'FOTO' : ext}
                </Badge>

                {isImage && item.progress ? (
                    <Badge variant="secondary" className="absolute bottom-2 right-2 text-[10px] shadow-sm">
                        {item.progress}
                    </Badge>
                ) : null}

                {isImage && item.koordinat ? (
                    <div className="absolute left-2 top-2 rounded-full border border-background/20 bg-emerald-600 p-1 text-white shadow-sm">
                        <MapPin className="h-3 w-3" />
                    </div>
                ) : null}
            </button>

            {!compact ? (
                <div className="space-y-1.5 p-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 flex-1 text-xs font-semibold leading-tight" title={item.name}>
                            {item.name}
                        </p>
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                            {formatRelativeDate(item.created_at)}
                        </span>
                    </div>

                    {showPekerjaan && item.pekerjaan_name ? (
                        <div className="flex min-w-0 items-center gap-1.5">
                            <Briefcase className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <p className="truncate text-[10px] font-medium text-muted-foreground" title={item.pekerjaan_name}>
                                {item.pekerjaan_name}
                            </p>
                        </div>
                    ) : null}

                    {item.owner_name ? (
                        <div className="flex min-w-0 items-center gap-1.5">
                            <User className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <p className="truncate text-[10px] font-medium text-muted-foreground" title={item.owner_name}>
                                {item.owner_name}
                            </p>
                        </div>
                    ) : null}

                    {(pageCount != null || sizeLabel) ? (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                            {pageCount != null ? (
                                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-medium">
                                    <FileText className="h-3 w-3" />
                                    {pageCount} halaman
                                </span>
                            ) : null}
                            {sizeLabel ? (
                                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-medium">
                                    {sizeLabel}
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}