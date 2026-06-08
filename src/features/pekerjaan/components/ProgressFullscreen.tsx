import { lazy, Suspense } from 'react';
import { useParams } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { lazyImport } from '@/lib/utils';

// Lazy load ProgressTabContent - contains Handsontable (~1.7MB)
const ProgressTabContent = lazy(() => lazyImport(() => import('./ProgressTabContent'), 'progress-tab-content-fullscreen'));

export default function ProgressFullscreen() {
    const { id } = useParams({ strict: false });
    const pekerjaanId = parseInt(id || '0');

    return (
        <div className="min-h-screen bg-background p-4">
            <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Memuat Progress...</span>
                </div>
            }>
                <ProgressTabContent pekerjaanId={pekerjaanId} />
            </Suspense>
        </div>
    );
}
