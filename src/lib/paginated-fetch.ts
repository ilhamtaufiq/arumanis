export interface PaginatedPage<T> {
    data: T[]
    meta?: { last_page?: number }
    last_page?: number
}

export async function fetchAllPages<T>(
    fetchPage: (page: number) => Promise<PaginatedPage<T>>,
): Promise<T[]> {
    const items: T[] = []
    let page = 1
    let lastPage = 1

    do {
        const response = await fetchPage(page)
        items.push(...response.data)
        lastPage = response.meta?.last_page ?? response.last_page ?? 1
        page += 1
    } while (page <= lastPage)

    return items
}