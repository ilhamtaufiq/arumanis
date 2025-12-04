import { Route, Routes } from 'react-router-dom';
import BerkasList from '../components/BerkasList';
import BerkasForm from '../components/BerkasForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const BerkasRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<BerkasList />} />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/berkas/new" requiredMethod="GET">
                        <BerkasForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/berkas/:id/edit" requiredMethod="GET">
                        <BerkasForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
