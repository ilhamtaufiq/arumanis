import { createFileRoute } from '@tanstack/react-router'
import { PuspenPekerjaanReviewPage } from '@/features/puspen/components/PuspenPekerjaanReviewPage'

export const Route = createFileRoute('/puspen/review-pekerjaan')({
    component: PuspenPekerjaanReviewRoute,
})

function PuspenPekerjaanReviewRoute() {
    return <PuspenPekerjaanReviewPage />
}