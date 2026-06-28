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
    Eye,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getFileExtension } from '@/lib/file-preview';

export interface MediaItem {
    id: number;
    type: 'image' | 'document';
    name: string;
    url: string;
    media_id?: number | null;
    pekerjaan_id: number;
    pekerjaan_name: string;
    created_at: string;
    progress?: string;
    koordinat?: string;
    komponen?: string;
    jenis_dokumen?: string;
}

interface MediaCardProps {
    item: MediaItem;
    onClick?: (item: MediaItem) => void;
    onDelete?: (item: MediaItem) => void;
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

export default function MediaCard({ item, onClick, onDelete }: MediaCardProps) {
    const ext = getFileExtension(item.url).toUpperCase() || 'FILE';
    const FileIcon = getFileIcon(item.type, item.url);
    const isImage = item.type === 'image';

    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/40 hover:shadow-md">
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
                        {onDelete ? (
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

            <div className="space-y-1.5 p-3">
                <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 flex-1 text-xs font-semibold leading-tight" title={item.name}>
                        {item.name}
                    </p>
                    <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                        {formatRelativeDate(item.created_at)}
                    </span>
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <p className="truncate text-[10px] font-medium text-muted-foreground" title={item.pekerjaan_name}>
                        {item.pekerjaan_name}
                    </p>
                </div>
            </div>
        </div>
    );
}