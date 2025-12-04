import { Route, Routes } from 'react-router-dom';
import RoleList from '../components/RoleList';
import RoleForm from '../components/RoleForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const RoleRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<RoleList />} />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/roles/new" requiredMethod="GET">
                        <RoleForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/roles/:id/edit" requiredMethod="GET">
                        <RoleForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
