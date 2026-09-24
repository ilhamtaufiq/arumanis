import { useEffect, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PekerjaanNamaPaketProps {
    namaPaket: string;
    isAdmin: boolean;
    disabled?: boolean;
    /** 'dblclick' untuk desktop, 'button' untuk sentuh/mobile */
    trigger?: 'dblclick' | 'button';
    wrapClassName?: string;
    inputClassName?: string;
    onSave: (value: string) => void;
}

/**
 * Nama paket dengan edit inline (Enter simpan, Escape batal, blur simpan).
 * Dipakai bersama oleh baris tabel desktop dan kartu mobile.
 */
export function PekerjaanNamaPaket({
    namaPaket,
    isAdmin,
    disabled = false,
    trigger = 'dblclick',
    wrapClassName,
    inputClassName,
    onSave,
}: PekerjaanNamaPaketProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(namaPaket);

    useEffect(() => {
        if (!isEditing) {
            setDraft(namaPaket);
        }
    }, [isEditing, namaPaket]);

    const save = () => {
        const nextName = draft.trim();

        if (!nextName) {
            toast.error('Nama paket tidak boleh kosong');
            setDraft(namaPaket);
            return;
        }

        setIsEditing(false);

        if (nextName !== namaPaket) {
            onSave(nextName);
        }
    };

    const cancel = () => {
        setDraft(namaPaket);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={cn('flex items-center gap-2', wrapClassName)}>
                <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={save}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            save();
                        }

                        if (event.key === 'Escape') {
                            event.preventDefault();
                            cancel();
                        }
                    }}
                    disabled={disabled}
                    autoFocus
                    className={cn('h-8 text-sm font-medium', inputClassName)}
                />
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={save}
                    disabled={disabled}
                    title="Simpan nama paket"
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={cancel}
                    disabled={disabled}
                    title="Batalkan edit nama paket"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn('flex items-start gap-1', wrapClassName)}>
            <button
                type="button"
                className={
                    isAdmin && trigger === 'dblclick'
                        ? 'min-w-0 break-words text-left leading-snug hover:text-primary'
                        : 'min-w-0 break-words text-left leading-snug'
                }
                onDoubleClick={
                    isAdmin && trigger === 'dblclick' ? () => setIsEditing(true) : undefined
                }
                title={isAdmin && trigger === 'dblclick' ? 'Double click untuk edit nama paket' : undefined}
            >
                {namaPaket}
            </button>
            {trigger === 'button' && isAdmin ? (
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={() => setIsEditing(true)}
                    disabled={disabled}
                    title="Edit nama paket"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
            ) : null}
        </div>
    );
}
