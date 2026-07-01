import { Link, useRouterState } from '@tanstack/react-router';
import { FileSpreadsheet, Mail, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    {
        to: '/settings',
        label: 'Pengaturan Umum',
        icon: Settings,
        exact: true,
    },
    {
        to: '/settings/kontrak-templates',
        label: 'Template Dokumen',
        icon: FileSpreadsheet,
        exact: false,
    },
    {
        to: '/settings/email-templates',
        label: 'Template Email',
        icon: Mail,
        exact: false,
    },
] as const;

export function SettingsSubNav() {
    const pathname = useRouterState({ select: (state) => state.location.pathname });

    return (
        <nav className="flex flex-wrap gap-2 border-b pb-4">
            {NAV_ITEMS.map((item) => {
                const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                            isActive
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}