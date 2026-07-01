import type { ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';

type ListPageLayoutProps = {
    title: string;
    description?: string;
    action?: ReactNode;
    cardTitle: string;
    toolbar?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    shell?: boolean;
};

function ListPageContent({
    title,
    description,
    action,
    cardTitle,
    toolbar,
    children,
    footer,
}: Omit<ListPageLayoutProps, 'shell'>) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description ? (
                        <p className="text-muted-foreground text-sm">{description}</p>
                    ) : null}
                </div>
                {action}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>{cardTitle}</CardTitle>
                        {toolbar}
                    </div>
                </CardHeader>
                <CardContent>{children}</CardContent>
                {footer ? <CardFooter>{footer}</CardFooter> : null}
            </Card>
        </div>
    );
}

export function ListPageLayout({
    shell = false,
    ...props
}: ListPageLayoutProps) {
    if (!shell) {
        return <ListPageContent {...props} />;
    }

    return (
        <>
            <Header />
            <Main>
                <ListPageContent {...props} />
            </Main>
        </>
    );
}