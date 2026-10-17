import { createFileRoute } from '@tanstack/react-router'
import PenyediaForm from '@/features/penyedia/components/PenyediaForm'
import PenyediaWhatsappSection from '@/features/penyedia/components/PenyediaWhatsappSection'

export const Route = createFileRoute('/_authenticated/penyedia/$id/edit')({
  component: PenyediaEditRoute,
})

function PenyediaEditRoute() {
  const { id } = Route.useParams()
  return (
    <div className="space-y-6">
      <PenyediaForm />
      <div className="mx-auto w-full max-w-3xl px-4 pb-8">
        <PenyediaWhatsappSection penyediaId={Number(id)} />
      </div>
    </div>
  )
}
