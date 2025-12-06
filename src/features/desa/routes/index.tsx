import { Route, Routes } from 'react-router-dom';
import DesaList from '../components/DesaList';
import DesaForm from '../components/DesaForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const DesaRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/desa" requiredMethod="GET">
                        <DesaList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/desa/new" requiredMethod="GET">
                        <DesaForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/desa/:id/edit" requiredMethod="GET">
                        <DesaForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
