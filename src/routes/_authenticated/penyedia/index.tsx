import { createFileRoute } from '@tanstack/react-router'
import PenyediaList from '@/features/penyedia/components/PenyediaList'

export const Route = createFileRoute('/_authenticated/penyedia/')({
  component: () => <PenyediaList />,
})
