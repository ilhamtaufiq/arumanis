import type { CompletenessGapType } from '../api/user-pekerjaan'

export const GAP_OPTIONS: Array<{ value: CompletenessGapType; label: string }> = [
    { value: 'foto', label: 'Foto' },
    { value: 'penerima', label: 'Penerima' },
    { value: 'progress', label: 'Progress' },
]

export const GAP_BADGE_VARIANT: Record<
    CompletenessGapType,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    foto: 'secondary',
    penerima: 'destructive',
    progress: 'outline',
}

export function getGapLabel(gap: CompletenessGapType): string {
    return GAP_OPTIONS.find((option) => option.value === gap)?.label ?? gap
}