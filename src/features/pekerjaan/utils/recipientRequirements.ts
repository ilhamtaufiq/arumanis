import type { Output } from '@/features/output/types';

export interface RecipientRequirement {
    id: number;
    name: string;
    targetRecipients: number;
}

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
