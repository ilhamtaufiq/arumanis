import { Route, Routes } from 'react-router-dom';
import KecamatanList from '../components/KecamatanList';
import KecamatanForm from '../components/KecamatanForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const KecamatanRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/kecamatan" requiredMethod="GET">
                        <KecamatanList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/kecamatan/new" requiredMethod="GET">
                        <KecamatanForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/kecamatan/:id/edit" requiredMethod="GET">
                        <KecamatanForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
