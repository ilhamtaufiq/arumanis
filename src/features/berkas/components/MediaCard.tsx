import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
    Briefcase
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface MediaItem {
    id: number;
    type: 'image' | 'document';
    name: string;
    url: string;
    pekerjaan_id: number;
    pekerjaan_name: string;
    created_at: string;
    // For images (foto)
    progress?: string;
    koordinat?: string;
    komponen?: string;
    // For documents (berkas)
    jenis_dokumen?: string;
}

interface MediaCardProps {
    item: MediaItem;
    isSelected?: boolean;
    onSelect?: (id: number) => void;
    onClick?: (item: MediaItem) => void;
    onDelete?: (id: number) => void;
}

// Helper to get file extension from URL
function getFileExtension(url: string): string {
    try {
        // Use URL constructor to safely parse the path (base URL is just for parsing, not used in production)
        const pathname = new URL(url, 'https://placeholder.local').pathname;
        const ext = pathname.split('.').pop()?.toUpperCase() || 'FILE';
        return ext.length > 4 ? 'FILE' : ext;
    } catch {
        // Fallback: extract extension from URL string directly
        const ext = url.split('.').pop()?.split('?')[0]?.toUpperCase() || 'FILE';
        return ext.length > 4 ? 'FILE' : ext;
    }
}

// Helper to format date
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Get file type icon based on extension
function getFileIcon(type: 'image' | 'document', url: string) {
    if (type === 'image') return ImageIcon;

    const ext = getFileExtension(url).toLowerCase();
    if (['pdf'].includes(ext)) return FileText;
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return Video;
    return File;
}

// Get badge color based on file type
function getBadgeColor(ext: string): string {
    const colors: Record<string, string> = {
        'jpg': 'bg-blue-500',
        'jpeg': 'bg-blue-500',
        'png': 'bg-green-500',
        'gif': 'bg-purple-500',
        'pdf': 'bg-red-500',
        'doc': 'bg-blue-600',
        'docx': 'bg-blue-600',
        'xls': 'bg-green-600',
        'xlsx': 'bg-green-600',
        'mp4': 'bg-orange-500',
    };
    return colors[ext.toLowerCase()] || 'bg-gray-500';
}

export default function MediaCard({
    item,
    isSelected = false,
    onSelect,
    onClick,
    onDelete
}: MediaCardProps) {
    const ext = getFileExtension(item.url);
    const FileIcon = getFileIcon(item.type, item.url);
    const isImage = item.type === 'image';

    return (
        <div
            className={cn(
                "group relative rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/50",
                isSelected && "ring-2 ring-primary border-primary"
            )}
        >
            {/* Selection Checkbox */}
            {onSelect && (
                <div className={cn(
                    "absolute top-2 left-2 z-10 transition-opacity",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(item.id)}
                        className="bg-white/90 backdrop-blur-sm"
                    />
                </div>
            )}

            {/* More Actions */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 backdrop-blur-sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </DropdownMenuItem>
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(item.id)}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Thumbnail Area */}
            <button
                onClick={() => onClick?.(item)}
                className="w-full aspect-square bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
            >
                {isImage ? (
                    <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileIcon className="h-16 w-16 mb-2" />
                    </div>
                )}

                {/* File Type Badge */}
                <Badge
                    className={cn(
                        "absolute bottom-2 left-2 text-[10px] text-white border-0",
                        getBadgeColor(ext)
                    )}
                >
                    {ext}
                </Badge>

                {/* Progress Badge for images */}
                {isImage && item.progress && (
                    <Badge
                        variant="secondary"
                        className="absolute bottom-2 right-2 text-[10px] shadow-sm"
                    >
                        {item.progress}
                    </Badge>
                )}

                {/* GPS Badge for images */}
                {isImage && item.koordinat && (
                    <div className="absolute top-2 right-2 z-10">
                        <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg border border-white/20">
                            <MapPin className="h-3 w-3" />
                        </div>
                    </div>
                )}
            </button>

            {/* Info Area */}
            <div className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs truncate flex-1 leading-tight" title={item.name}>
                        {item.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">{formatDate(item.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-1.5 min-w-0">
                    <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-[10px] text-muted-foreground truncate font-medium" title={item.pekerjaan_name}>
                        {item.pekerjaan_name}
                    </p>
                </div>

                {isImage && item.koordinat && (
                    <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-mono bg-emerald-50 w-fit px-1 rounded border border-emerald-100">
                        <MapPin className="h-2.5 w-2.5" />
                        {item.koordinat.substring(0, 15)}...
                    </div>
                )}
            </div>
        </div>
    );
}
