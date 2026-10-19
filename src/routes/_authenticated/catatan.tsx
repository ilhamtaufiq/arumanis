import { createFileRoute } from '@tanstack/react-router'
import { CatatanPage } from '@/features/catatan/components/CatatanPage'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export const Route = createFileRoute('/_authenticated/catatan')({
    component: () => (
        <>
            <Header fixed />
            <Main>
                <CatatanPage />
            </Main>
        </>
    ),
})
