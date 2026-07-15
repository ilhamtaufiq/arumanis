import { useAuthStore } from '@/stores/auth-stores';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImpersonateBanner() {
    const { auth } = useAuthStore();

    if (!auth.isImpersonating || !auth.impersonator) {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 flex flex-col gap-2 bg-amber-500 px-3 py-2 text-white shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex min-w-0 items-start gap-2 sm:items-center">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 animate-pulse sm:mt-0" />
                <span className="text-xs font-medium leading-snug sm:text-sm">
                    Anda sedang melakukan impersonasi sebagai{' '}
                    <span className="font-bold underline break-words">{auth.user?.name}</span>
                    {auth.user?.email ? (
                        <span className="block opacity-90 sm:inline sm:before:content-['\00a0']">
                            ({auth.user.email})
                        </span>
                    ) : null}
                </span>
            </div>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => auth.stopImpersonating()}
                className="w-full shrink-0 gap-2 bg-white font-bold text-amber-600 hover:bg-amber-50 sm:w-auto"
            >
                <LogOut className="h-4 w-4" />
                Berhenti Impersonasi
            </Button>
        </div>
    );
}
