import { createFileRoute } from '@tanstack/react-router'
import { SpamKelembagaanPublicForm } from '@/features/spam-unit/components/SpamKelembagaanPublicForm'

export const Route = createFileRoute('/kelembagaan-spam/form/$token')({
    component: KelembagaanPublicFormRoute,
})

function KelembagaanPublicFormRoute() {
    const { token } = Route.useParams()
    return (
        <div className="min-h-screen bg-background">
            <SpamKelembagaanPublicForm token={token} />
        </div>
    )
}
