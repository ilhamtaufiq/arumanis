import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SpamUnitPage } from '@/features/spam-unit'

export const Route = createFileRoute('/_authenticated/spam-unit/')({
    component: SpamUnitRoute,
})

function SpamUnitRoute() {
    return (
        <>
            <Header fixed />
            <Main>
                <SpamUnitPage />
            </Main>
        </>
    )
}
