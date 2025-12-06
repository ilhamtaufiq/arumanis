import { Route, Routes } from 'react-router-dom';
import KegiatanList from '../components/KegiatanList';
import KegiatanForm from '../components/KegiatanForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const KegiatanRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/kegiatan" requiredMethod="GET">
                        <KegiatanList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/kegiatan/new" requiredMethod="GET">
                        <KegiatanForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/kegiatan/:id/edit" requiredMethod="GET">
                        <KegiatanForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
