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
        <div className="min-w-0 space-y-6">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight break-words sm:text-2xl">{title}</h1>
                    {description ? (
                        <p className="text-muted-foreground text-sm break-words">{description}</p>
                    ) : null}
                </div>
                {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
            </div>

            <Card className="min-w-0 overflow-hidden">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <CardTitle className="min-w-0 break-words">{cardTitle}</CardTitle>
                        {toolbar ? <div className="w-full min-w-0 sm:w-auto">{toolbar}</div> : null}
                    </div>
                </CardHeader>
                <CardContent className="min-w-0 overflow-x-auto">{children}</CardContent>
                {footer ? <CardFooter className="min-w-0">{footer}</CardFooter> : null}
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