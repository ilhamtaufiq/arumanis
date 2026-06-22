import { Link } from '@tanstack/react-router';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FormActionsProps = {
    cancelTo: string;
    isSubmitting?: boolean;
    submitLabel?: string;
    submittingLabel?: string;
};

export function FormActions({
    cancelTo,
    isSubmitting = false,
    submitLabel = 'Simpan',
    submittingLabel = 'Menyimpan...',
}: FormActionsProps) {
    return (
        <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" asChild>
                <Link to={cancelTo}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? submittingLabel : submitLabel}
            </Button>
        </div>
    );
}