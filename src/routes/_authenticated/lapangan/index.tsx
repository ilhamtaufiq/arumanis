import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LapanganScreen } from '@/features/mobile/screens/LapanganScreen'

export const Route = createFileRoute('/_authenticated/lapangan/')({
    component: LapanganRoute,
})

/** Lapangan di web: feed dan posting yang sama dengan versi mobile, dengan sidebar. */
function LapanganRoute() {
    return (
        <>
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <LapanganScreen />
            </Main>
        </>
    )
}
