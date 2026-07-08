import { FileSpreadsheet } from 'lucide-react';
import { SettingsSubNav } from './SettingsSubNav';
import KontrakTemplateSettings from './KontrakTemplateSettings';
import KontrakPejabatSettings from './KontrakPejabatSettings';
import { KontrakPlaceholderReference } from './KontrakPlaceholderReference';

export default function KontrakTemplatesPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Template Dokumen Kontrak</h1>
                    <p className="text-muted-foreground">
                        Kelola template SPK, ringkasan, cover, dan BAP. Lihat daftar placeholder yang bisa dipakai di
                        dokumen.
                    </p>
                </div>
            </div>

            <SettingsSubNav />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
                <div className="space-y-6">
                    <KontrakPejabatSettings />
                    <KontrakTemplateSettings />
                </div>
                <KontrakPlaceholderReference />
            </div>
        </div>
    );
}