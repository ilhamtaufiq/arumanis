import { Route, Routes } from 'react-router-dom';
import SettingsPage from '../components/SettingsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const SettingsRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute requiredPath="/settings" requiredMethod="GET">
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
