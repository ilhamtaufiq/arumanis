import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { AssignmentHero } from './AssignmentHero'
import { AssignPekerjaanForm } from './AssignPekerjaanForm'
import { AssignmentList } from './AssignmentList'
import { useAssignments } from '../hooks/useUserPekerjaan'

export function AssignmentManager() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { data: assignments = [], isLoading } = useAssignments()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Assign Pekerjaan</h1>
                <p className="text-sm text-muted-foreground">
                    Kelola penugasan pengawas lapangan ke pekerjaan aktif
                </p>
            </div>

            <AssignmentHero
                assignments={assignments}
                tahunAnggaran={tahunAnggaran}
                isLoading={isLoading}
            />
            <AssignPekerjaanForm tahunAnggaran={tahunAnggaran} />
            <AssignmentList />
        </div>
    )
}