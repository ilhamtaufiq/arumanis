import { createFileRoute } from '@tanstack/react-router'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'

export const Route = createFileRoute('/_authenticated/calendar/')({
    component: () => (
        <>
            <Header />
            <Main>
                <div className='flex items-center justify-between space-y-2 mb-4'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Calendar</h2>
                        <p className='text-muted-foreground'>
                            Manage your schedule and events here.
                        </p>
                    </div>
                </div>
                <CalendarView />
            </Main>
        </>
    ),
})
