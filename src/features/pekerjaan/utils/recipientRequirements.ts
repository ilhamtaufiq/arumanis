import type { Output } from '@/features/output/types';

export interface RecipientRequirement {
    id: number;
    name: string;
    targetRecipients: number;
}

export interface PenerimaTypeBreakdown {
    total: number;
    individual: number;
    komunal: number;
}

/**
 * Hitung sebaran tipe penerima (Individual vs Komunal).
 * Keduanya dihitung 1 unit untuk kebutuhan volume output non-komunal.
 */
export const getPenerimaTypeBreakdown = (
    penerimaList: Array<{ is_komunal?: boolean | null }>,
): PenerimaTypeBreakdown => {
    let individual = 0;
    let komunal = 0;

    for (const item of penerimaList) {
        if (item.is_komunal) {
            komunal += 1;
        } else {
            individual += 1;
        }
    }

    return {
        total: individual + komunal,
        individual,
        komunal,
    };
};

export const formatPenerimaBreakdownLabel = (breakdown: PenerimaTypeBreakdown): string => {
    return `${breakdown.total} total (${breakdown.individual} Individual, ${breakdown.komunal} Komunal)`;
};

export const getRecipientRequirement = (output: Output): RecipientRequirement | null => {
    if (output.penerima_is_optional) return null;
    if (output.satuan?.toLowerCase() !== 'unit') return null;

    return {
        id: output.id,
        name: output.komponen,
        targetRecipients: Math.max(1, Math.round(output.volume || 1)),
    };
};

export const getRecipientRequirements = (outputs: Output[]) => {
    return outputs
        .map(getRecipientRequirement)
        .filter((item): item is RecipientRequirement => item !== null);
};
