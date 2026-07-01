import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type DriveZoneCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    accentClass: string;
    itemLabel?: string;
    onOpen: () => void;
};

export default function DriveZoneCard({
    title,
    description,
    icon: Icon,
    accentClass,
    itemLabel,
    onOpen,
}: DriveZoneCardProps) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className={cn(
                'group flex w-full flex-col rounded-2xl border bg-card p-5 text-left transition-all',
                'hover:shadow-md',
                accentClass,
            )}
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="rounded-2xl p-3 transition-transform group-hover:scale-105">
                    <Icon className="h-8 w-8" />
                </div>
            </div>

            <p className="text-base font-semibold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            {itemLabel ? (
                <p className="mt-4 text-[11px] font-medium text-muted-foreground">{itemLabel}</p>
            ) : null}
        </button>
    );
}