import { LegalCallout } from '../legal-page-layout'

export function InnovationSpmScopeCallout() {
    return (
        <LegalCallout variant='important'>
            <strong>Cakupan capaian SPM:</strong> modul operasional, API publik, peta landing, dan angka live
            pada dokumen ini mencakup <strong>SPM bidang air minum</strong> (unit SPAM, SR, KK, jiwa
            terlayani) dan <strong>SPM bidang sanitasi</strong> (infrastruktur, cakupan desa, pemanfaat).
            Data sanitasi dapat masih dalam proses sinkronisasi — perhatikan disclaimer pada peta capaian
            SPM di landing.
        </LegalCallout>
    )
}