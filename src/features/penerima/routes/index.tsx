import { Route, Routes } from 'react-router-dom';
import PenerimaList from '../components/PenerimaList';
import PenerimaForm from '../components/PenerimaForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const PenerimaRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PenerimaList />} />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/penerima/new" requiredMethod="GET">
                        <PenerimaForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/penerima/:id/edit" requiredMethod="GET">
                        <PenerimaForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
