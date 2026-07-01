import { createFileRoute } from '@tanstack/react-router'
import { TujuanManfaatHasil } from '@/features/public/tujuan-manfaat-hasil'

export const Route = createFileRoute('/tujuan-manfaat-hasil')({
    component: TujuanManfaatHasil,
})