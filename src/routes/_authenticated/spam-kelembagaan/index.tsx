import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import SpamKelembagaanPage from '@/features/spam-kelembagaan/components/SpamKelembagaanPage'

export const Route = createFileRoute('/_authenticated/spam-kelembagaan/')({
    component: SpamKelembagaanRoute,
})

function SpamKelembagaanRoute() {
    return (
        <>
            <Header fixed />
            <Main>
                <SpamKelembagaanPage />
            </Main>
        </>
    )
}
