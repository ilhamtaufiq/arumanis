import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SpmSanitasiPage } from '@/features/spm-sanitasi'

export const Route = createFileRoute('/_authenticated/spm-sanitasi/')({
    component: SpmSanitasiRoute,
})

function SpmSanitasiRoute() {
    return (
        <>
            <Header fixed />
            <Main>
                <SpmSanitasiPage />
            </Main>
        </>
    )
}