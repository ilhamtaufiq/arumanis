import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import SpamTerbangunRawPage from '@/features/spam-terbangun/components/SpamTerbangunRawPage'

export const Route = createFileRoute('/_authenticated/spam-terbangun/')({
    component: SpamTerbangunRoute,
})

function SpamTerbangunRoute() {
    return (
        <>
            <Header fixed />
            <Main>
                <SpamTerbangunRawPage />
            </Main>
        </>
    )
}
