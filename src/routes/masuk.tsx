import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MasukScreen } from '@/features/mobile/screens/MasukScreen'

const masukSearchSchema = z.object({
    redirect: z.string().optional(),
})

/** Login mobile. Di luar area /m agar tidak terkena guard beranda mobile. */
export const Route = createFileRoute('/masuk')({
    validateSearch: masukSearchSchema,
    component: MasukRoute,
})

function MasukRoute() {
    const { redirect } = Route.useSearch()
    return <MasukScreen redirect={redirect ?? '/m'} />
}
