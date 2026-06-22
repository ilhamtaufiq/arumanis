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
            <div className="w-full space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                        <Link to={backTo}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {description ? (
                            <p className="text-muted-foreground text-sm">{description}</p>
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