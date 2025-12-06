import { Route, Routes } from 'react-router-dom';
import RoutePermissionList from '../components/RoutePermissionList';
import RoutePermissionForm from '../components/RoutePermissionForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const RoutePermissionRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/route-permissions" requiredMethod="GET">
                        <RoutePermissionList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/route-permissions/new" requiredMethod="GET">
                        <RoutePermissionForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/route-permissions/:id/edit" requiredMethod="GET">
                        <RoutePermissionForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
