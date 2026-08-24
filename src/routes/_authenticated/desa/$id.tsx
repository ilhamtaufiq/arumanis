import { createFileRoute } from '@tanstack/react-router'
import DesaProfilePage from '@/features/desa-profile/components/DesaProfilePage'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export const Route = createFileRoute('/_authenticated/desa/$id')({
  component: () => (
    <>
      <Header fixed />
      <Main>
        <DesaProfilePage />
      </Main>
    </>
  ),
})