import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ListRowActionsProps = {
    edit?: ReactNode;
    onDelete?: () => void;
    extra?: ReactNode;
};

export function ListRowActions({ edit, onDelete, extra }: ListRowActionsProps) {
    return (
        <div className="flex items-center justify-end space-x-2">
            {edit}
            {extra}
            {onDelete ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ) : null}
        </div>
    );
}