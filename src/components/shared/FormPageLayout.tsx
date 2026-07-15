import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageContainer from '@/components/layout/page-container';

type FormPageLayoutProps = {
    backTo: string;
    title: string;
    description?: string;
    cardTitle: string;
    isLoadingDetail?: boolean;
    loadingMessage?: string;
    children: ReactNode;
};

export function FormPageLayout({
    backTo,
    title,
    description,
    cardTitle,
    isLoadingDetail = false,
    loadingMessage = 'Memuat data...',
    children,
}: FormPageLayoutProps) {
    return (
        <PageContainer>
            <div className="w-full min-w-0 space-y-6">
                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                    <Button variant="outline" size="icon" className="shrink-0 rounded-full" asChild>
                        <Link to={backTo}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold tracking-tight break-words sm:text-2xl md:text-3xl">{title}</h1>
                        {description ? (
                            <p className="text-muted-foreground text-sm break-words">{description}</p>
                        ) : null}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{cardTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingDetail ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                                <p>{loadingMessage}</p>
                            </div>
                        ) : (
                            children
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}