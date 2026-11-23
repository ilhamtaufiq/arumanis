import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProgresScreen } from '@/features/mobile/screens/ProgresScreen'

export const Route = createFileRoute('/_authenticated/progres/')({
    component: ProgresRoute,
})

/** Progres fisik pekerjaan di web, dibuka dari sidebar. Tampilannya sama dengan versi mobile. */
function ProgresRoute() {
    return (
        <>
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <ProgresScreen />
            </Main>
        </>
    )
}
