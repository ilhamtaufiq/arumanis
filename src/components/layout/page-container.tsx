import { type ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';

type PageHeaderProps = {
    children: ReactNode;
    title?: string;
};

export function PageHeader({ children, title }: PageHeaderProps) {
    return (
        <Header>
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {children}
        </Header>
    );
}

type PageContainerProps = {
    children: ReactNode;
    fluid?: boolean;
};

export function PageContainer({ children, fluid = false }: PageContainerProps) {
    return (
        <>
            <Header />
            <Main fluid={fluid}>{children}</Main>
        </>
    );
}
