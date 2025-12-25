import { createFileRoute } from '@tanstack/react-router';
import { AssignmentManager } from '@/features/user-pekerjaan/components/AssignmentManager';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/_authenticated/user-pekerjaan/')({
    component: UserPekerjaanPage,
});

function UserPekerjaanPage() {
    return (
        <ProtectedRoute requiredPath="/user-pekerjaan" requiredMethod="GET">
            <Header>
                <div>
                    <h1 className="text-2xl font-bold">Assign Pekerjaan</h1>
                    <p className="text-muted-foreground">
                        Kelola assignment pengawas lapangan ke pekerjaan
                    </p>
                </div>
            </Header>
            <Main>
                <AssignmentManager />
            </Main>
        </ProtectedRoute>
    );
}
