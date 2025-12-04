import { Routes, Route } from 'react-router-dom';
import KontrakList from '../components/KontrakList';
import KontrakForm from '../components/KontrakForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function KontrakRoutes() {
    return (
        <Routes>
            <Route index element={<KontrakList />} />
            <Route
                path="new"
                element={
                    <ProtectedRoute requiredPath="/kontrak/new" requiredMethod="GET">
                        <KontrakForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path=":id/edit"
                element={
                    <ProtectedRoute requiredPath="/kontrak/:id/edit" requiredMethod="GET">
                        <KontrakForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
