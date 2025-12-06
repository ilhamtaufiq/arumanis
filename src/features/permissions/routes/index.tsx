import { Route, Routes } from 'react-router-dom';
import PermissionList from '../components/PermissionList';
import PermissionForm from '../components/PermissionForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const PermissionRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/permissions" requiredMethod="GET">
                        <PermissionList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/permissions/new" requiredMethod="GET">
                        <PermissionForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/permissions/:id/edit" requiredMethod="GET">
                        <PermissionForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
