import { createFileRoute } from '@tanstack/react-router'
import PenyediaForm from '@/features/penyedia/components/PenyediaForm'

export const Route = createFileRoute('/_authenticated/penyedia/$id/edit')({
  component: () => <PenyediaForm />,
})
