import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SpamTerbangunStagingPage } from '@/features/spam-unit/components/SpamTerbangunStagingPage'

export const Route = createFileRoute('/_authenticated/spam-unit/terbangun')({
    component: SpamTerbangunRoute,
})

function SpamTerbangunRoute() {
    return (
        <>
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <SpamTerbangunStagingPage />
            </Main>
        </>
    )
}
