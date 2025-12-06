import { Route, Routes } from 'react-router-dom';
import KegiatanRoleList from '../components/KegiatanRoleList';
import KegiatanRoleForm from '../components/KegiatanRoleForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const KegiatanRoleRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/kegiatan-role" requiredMethod="GET">
                        <KegiatanRoleList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/kegiatan-role/new" requiredMethod="GET">
                        <KegiatanRoleForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

