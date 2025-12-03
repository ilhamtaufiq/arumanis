import type { ReactNode } from 'react';
import { MainNavigationMenu } from './navigation-menu';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <MainNavigationMenu />
            <main>
                {children}
            </main>
        </div>
    );
}
