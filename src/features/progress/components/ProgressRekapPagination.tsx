import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

type ProgressRekapPaginationProps = {
    currentPage: number
    totalPages: number
    onChange: (page: number) => void
}

export function ProgressRekapPagination({ currentPage, totalPages, onChange }: ProgressRekapPaginationProps) {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5
    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i)
        pages.push('ellipsis')
        pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        pages.push('ellipsis')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('ellipsis')
        pages.push(totalPages)
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) onChange(currentPage - 1) }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
                {pages.map((p, index) => (
                    <PaginationItem key={index}>
                        {p === 'ellipsis' ? <PaginationEllipsis /> : (
                            <PaginationLink
                                href="#"
                                onClick={(e) => { e.preventDefault(); onChange(p as number) }}
                                isActive={currentPage === p}
                            >
                                {p}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onChange(currentPage + 1) }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
