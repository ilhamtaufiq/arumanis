import { Settings } from 'lucide-react';
import AppSettingsForm from './AppSettingsForm';

export default function SettingsPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center space-x-4">
                <Settings className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan Aplikasi</h1>
                    <p className="text-muted-foreground">Kelola konfigurasi sistem dan parameter global aplikasi</p>
                </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
                <AppSettingsForm />
            </div>
        </div>
    );
}
