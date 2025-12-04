import { Route, Routes } from 'react-router-dom';
import FotoList from '../components/FotoList';
import FotoForm from '../components/FotoForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const FotoRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<FotoList />} />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/foto/new" requiredMethod="GET">
                        <FotoForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/foto/:id/edit" requiredMethod="GET">
                        <FotoForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
