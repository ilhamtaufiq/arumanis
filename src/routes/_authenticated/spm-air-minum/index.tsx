import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import SpmAirMinumPage from '@/features/spm-air-minum/components/SpmAirMinumPage'

export const Route = createFileRoute('/_authenticated/spm-air-minum/')({
    component: SpmAirMinumRoute,
})

function SpmAirMinumRoute() {
    return (
        <>
            <Header fixed />
            <Main>
                <SpmAirMinumPage />
            </Main>
        </>
    )
}
