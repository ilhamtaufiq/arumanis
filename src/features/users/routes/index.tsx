import { Route, Routes } from 'react-router-dom';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const UserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<UserList />} />
            <Route
                path="/new"
                element={
                    <ProtectedRoute requiredPath="/users/new" requiredMethod="GET">
                        <UserForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/:id/edit"
                element={
                    <ProtectedRoute requiredPath="/users/:id/edit" requiredMethod="GET">
                        <UserForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
