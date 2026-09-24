import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { z } from 'zod'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DriveMediaPage } from '@/features/berkas/components/drive/DriveMediaPage'

const mediaSearchSchema = z.object({
    page: z.coerce.number().optional().catch(1),
    search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/berkas/media')({
    validateSearch: mediaSearchSchema,
    component: BerkasMediaRoute,
})

function BerkasMediaRoute() {
    const search = Route.useSearch()
    const navigate = useNavigate({ from: '/berkas/media' })
    const page = search.page && search.page > 0 ? search.page : 1

    const handlePageChange = useCallback(
        (next: number) => {
            void navigate({ search: (prev) => ({ ...prev, page: next }), replace: true })
        },
        [navigate],
    )

    const handleSearchChange = useCallback(
        (next: string) => {
            void navigate({ search: (prev) => ({ ...prev, search: next || undefined, page: 1 }), replace: true })
        },
        [navigate],
    )

    return (
        <ProtectedRoute requiredPath='/berkas' requiredMethod='GET'>
            <DriveMediaPage page={page} search={search.search ?? ''} onPageChange={handlePageChange} onSearchChange={handleSearchChange} />
        </ProtectedRoute>
    )
}
