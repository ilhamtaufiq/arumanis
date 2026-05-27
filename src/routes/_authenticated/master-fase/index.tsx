import { createFileRoute } from '@tanstack/react-router';
import MasterFaseList from '@/features/master-fase/components/MasterFaseList';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/_authenticated/master-fase/')({
  component: () => (
    <ProtectedRoute requiredPath="/master-fase" requiredMethod="GET">
      <MasterFaseList />
    </ProtectedRoute>
  ),
});
