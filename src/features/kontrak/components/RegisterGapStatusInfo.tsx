import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { KontrakAddendumRegisterGap } from '../types';
import {
    ADDENDUM_REGISTER_GAP_DESCRIPTION,
    ADDENDUM_REGISTER_GAP_HEADLINE,
    getRegisterGapStatusItems,
} from '../lib/addendum-register-gap';

type RegisterGapStatusInfoProps = {
    gap: KontrakAddendumRegisterGap;
    compact?: boolean;
};

export function RegisterGapStatusInfo({ gap, compact = false }: RegisterGapStatusInfoProps) {
    const items = getRegisterGapStatusItems(gap);

    return (
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
            <div className="space-y-1">
                <p className={`font-medium text-amber-900 dark:text-amber-200 ${compact ? 'text-sm' : 'text-base'}`}>
                    {ADDENDUM_REGISTER_GAP_HEADLINE}
                </p>
                {!compact && (
                    <p className="text-sm text-muted-foreground">{ADDENDUM_REGISTER_GAP_DESCRIPTION}</p>
                )}
            </div>
            <ul className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                {items.map((item) => (
                    <li
                        key={item.key}
                        className="flex items-start gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2"
                    >
                        {item.done ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        )}
                        <div className="min-w-0">
                            <p className="font-medium">{item.label}</p>
                            <p className="text-muted-foreground break-words">{item.value}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}