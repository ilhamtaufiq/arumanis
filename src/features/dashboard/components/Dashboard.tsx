import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { DashboardAktivitas } from './DashboardAktivitas'
import { DashboardHariIni } from './DashboardHariIni'
import { DashboardPerluTindakan } from './DashboardPerluTindakan'
import { DashboardProgresTerendah } from './DashboardProgresTerendah'
import { DashboardRingkasan } from './DashboardRingkasan'
import { DashboardSpmCharts } from './DashboardSpmCharts'

function greeting() {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
}

/**
 * Beranda. Urutan dari yang butuh tindakan: notifikasi dan tiket, jadwal hari ini, lalu angka.
 * Angka ringkasan dan grafik SPM hanya untuk admin dan manager. Keuangan dan Program punya halaman sendiri.
 */
export function Dashboard() {
    const { tahunAnggaran } = useAppSettingsValues()
    const user = useAuthStore((s) => s.auth.user)
    const bisaLihatAngka =
        user?.roles?.some((role) => role === 'admin' || role === 'manager') ?? false

    const todayLabel = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-6">
                    <Heading
                        title={`${greeting()}${user?.name ? `, ${user.name}` : ''}`}
                        description={`${todayLabel} · TA ${tahunAnggaran}`}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <DashboardPerluTindakan />
                        <DashboardHariIni />
                    </div>

                    {bisaLihatAngka ? (
                        <section aria-label="Ringkasan" className="flex flex-col gap-6">
                            <DashboardRingkasan />
                            <DashboardSpmCharts />
                        </section>
                    ) : null}

                    <DashboardProgresTerendah />

                    <DashboardAktivitas />
                </div>
            </Main>
        </>
    )
}
