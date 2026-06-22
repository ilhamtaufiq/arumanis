import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export type ListPaginationMeta = {
    from?: number | null;
    to?: number | null;
    total?: number;
    label?: string;
};

type ListPaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    variant?: 'full' | 'simple';
    hasNextPage?: boolean;
    meta?: ListPaginationMeta;
};

function buildPageItems(page: number, totalPages: number): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    }

    if (page <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
        return pages;
    }

    if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
        return pages;
    }

    pages.push(1);
    pages.push('ellipsis');
    pages.push(page - 1);
    pages.push(page);
    pages.push(page + 1);
    pages.push('ellipsis');
    pages.push(totalPages);

    return pages;
}

export function ListPagination({
    page,
    totalPages,
    onPageChange,
    disabled = false,
    variant = 'full',
    hasNextPage,
    meta,
}: ListPaginationProps) {
    if (variant === 'simple') {
        const canGoNext = hasNextPage ?? page < totalPages;

        return (
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1 || disabled}
                >
                    Sebelumnya
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!canGoNext || disabled}
                >
                    Berikutnya
                </Button>
            </div>
        );
    }

    if (totalPages <= 1 && !meta) {
        return null;
    }

    const pages = buildPageItems(page, totalPages);

    const pagination = (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) onPageChange(page - 1);
                        }}
                        className={page === 1 || disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>

                {pages.map((p, index) => (
                    <PaginationItem key={index}>
                        {p === 'ellipsis' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(p);
                                }}
                                isActive={page === p}
                                className={disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            >
                                {p}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) onPageChange(page + 1);
                        }}
                        className={page === totalPages || disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );

    if (!meta) {
        return pagination;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Menampilkan{' '}
                <span className="font-medium text-foreground">{meta.from || 0}</span>
                {' '}sampai{' '}
                <span className="font-medium text-foreground">{meta.to || 0}</span>
                {' '}dari{' '}
                <span className="font-medium text-foreground">{meta.total || 0}</span>
                {meta.label ? ` ${meta.label}` : ''}
            </div>
            <div className="order-1 sm:order-2">{pagination}</div>
        </div>
    );
}