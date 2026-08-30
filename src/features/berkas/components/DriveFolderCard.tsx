import { Folder, CheckSquare, Square, MoreVertical, Pencil, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type DriveFolderCardProps = {
    name: string;
    subtitle?: string;
    meta?: string;
    accent?: 'amber' | 'blue' | 'violet';
    variant?: 'grid' | 'list';
    onOpen: () => void;
    onRename?: () => void;
    onShare?: () => void;
    canManage?: boolean;
    selectable?: boolean;
    selected?: boolean;
};

const accentStyles = {
    amber: {
        card: 'hover:border-amber-500/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/20',
        icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    },
    blue: {
        card: 'hover:border-blue-500/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20',
        icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
    },
    violet: {
        card: 'hover:border-violet-500/40 hover:bg-violet-50/40 dark:hover:bg-violet-950/20',
        icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
    },
};

export default function DriveFolderCard({
    name,
    subtitle,
    meta,
    accent = 'blue',
    variant = 'grid',
    onOpen,
    onRename,
    onShare,
    canManage = true,
    selectable = false,
    selected = false,
}: DriveFolderCardProps) {
    const styles = accentStyles[accent];

    const menu = canManage && (onRename || onShare) ? (
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
                {onRename ? (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Ganti Nama
                    </DropdownMenuItem>
                ) : null}
                {onShare ? (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(); }}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Bagikan
                    </DropdownMenuItem>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    ) : null;

    if (variant === 'list') {
        return (
            <button
                type="button"
                onClick={onOpen}
                className={cn(
                    'group flex w-full items-center gap-4 p-4 text-left transition-colors',
                    styles.card,
                    selectable && selected && 'bg-primary/5',
                )}
            >
                {selectable ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border">
                        {selected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                    </span>
                ) : null}
                <div className={cn('rounded-xl p-2.5', styles.icon)}>
                    <Folder className="h-6 w-6 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium" title={name}>{name}</p>
                    {subtitle ? (
                        <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
                    ) : null}
                </div>
                {meta ? (
                    <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
                ) : null}
                {menu ? (
                    <span className="shrink-0" onClick={(e) => e.stopPropagation()}>{menu}</span>
                ) : null}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onOpen}
            className={cn(
                'group flex w-full flex-col rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-md',
                styles.card,
                selectable && selected && 'border-primary ring-2 ring-primary/40',
            )}
        >
            <div className="mb-2 flex items-center justify-end gap-2 self-end">
                {selectable ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border bg-background/90 shadow-sm">
                        {selected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                    </span>
                ) : null}
                {menu ? (
                    <span className="opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        {menu}
                    </span>
                ) : null}
            </div>
            <div className={cn('mb-4 w-fit rounded-2xl p-3 transition-transform group-hover:scale-105', styles.icon)}>
                <Folder className="h-8 w-8 fill-current" />
            </div>
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug" title={name}>
                {name}
            </p>
            {subtitle ? (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
            {meta ? (
                <p className="mt-4 text-[11px] font-medium text-muted-foreground">{meta}</p>
            ) : null}
        </button>
    );
}