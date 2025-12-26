import { useAuthStore } from '@/stores/auth-stores';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImpersonateBanner() {
    const { auth } = useAuthStore();

    if (!auth.isImpersonating || !auth.impersonator) {
        return null;
    }

    return (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-medium">
                    Anda sedang melakukan impersonasi sebagai <span className="font-bold underline">{auth.user?.name}</span> ({auth.user?.email})
                </span>
            </div>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => auth.stopImpersonating()}
                className="bg-white text-amber-600 hover:bg-amber-50 gap-2 font-bold"
            >
                <LogOut className="h-4 w-4" />
                Berhenti Impersonasi
            </Button>
        </div>
    );
}
