import { createFileRoute } from '@tanstack/react-router'
import TiketPage from '@/features/tiket/components/TiketPage'
import { z } from 'zod'

const ticketSearchSchema = z.object({
    ticketId: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/tiket/')({
    validateSearch: (search) => ticketSearchSchema.parse(search),
    component: TiketPage,
})
