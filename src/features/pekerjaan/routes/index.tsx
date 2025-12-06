import { Route, Routes } from 'react-router-dom';
import PekerjaanList from '../components/PekerjaanList';
import PekerjaanForm from '../components/PekerjaanForm';
import PekerjaanDetail from '../components/PekerjaanDetail';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const PekerjaanRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
                        <PekerjaanList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/pekerjaan/new" requiredMethod="GET">
                        <PekerjaanForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id"
                element={
                    <ProtectedRoute requiredPath="/pekerjaan/:id" requiredMethod="GET">
                        <PekerjaanDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/pekerjaan/:id/edit" requiredMethod="GET">
                        <PekerjaanForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

