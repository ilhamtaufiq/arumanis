import React from 'react';
import { useLocation, Link } from '@tanstack/react-router';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { sidebarData } from './data/sidebar-data';

export function AutoBreadcrumbs({ className }: { className?: string }) {
    const location = useLocation();
    const paths = location.pathname.split('/').filter(Boolean);

    // Helper to find title from sidebar data
    const getTitle = (path: string) => {
        // Check navGroups
        for (const group of sidebarData.navGroups) {
            const item = group.items.find((i) => i.url === `/${path}`);
            if (item) return item.title;
        }

        // Handle common cases
        if (path === 'new') return 'Tambah Baru';
        if (path === 'edit') return 'Edit Data';

        // Fallback to title case
        return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    };

    if (paths.length === 0) return null;

    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {paths.map((path, index) => {
                    const isLast = index === paths.length - 1;
                    const url = `/${paths.slice(0, index + 1).join('/')}`;
                    const title = getTitle(path);

                    // Skip IDs (check if path is a number)
                    if (!isNaN(Number(path))) return null;

                    return (
                        <React.Fragment key={url}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={url as any}>{title}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
