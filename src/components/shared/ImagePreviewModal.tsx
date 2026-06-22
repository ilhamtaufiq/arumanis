import type { ReactNode } from 'react';
import { ExternalLink, MapPin, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ImagePreviewModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageUrl: string;
    title?: string;
    badge?: string;
    coordinate?: string | null;
    footer?: ReactNode;
};

export function ImagePreviewModal({
    open,
    onOpenChange,
    imageUrl,
    title = 'Preview Foto',
    badge,
    coordinate,
    footer,
}: ImagePreviewModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
            >
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
                    <DialogTitle className="truncate pr-4 text-base">{title}</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                <div className="flex min-h-[280px] max-h-[60vh] items-center justify-center bg-black/5 dark:bg-black/20">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-h-[60vh] max-w-full object-contain"
                    />
                </div>

                <div className="space-y-2 border-t bg-muted/30 p-4">
                    {(badge || coordinate) && (
                        <div className="flex flex-wrap gap-4 text-sm">
                            {badge ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Progress:</span>
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                                        {badge}
                                    </span>
                                </div>
                            ) : null}
                            {coordinate ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-mono text-xs">{coordinate}</span>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {footer ?? (
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(imageUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Buka di Tab Baru
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                                Tutup
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}