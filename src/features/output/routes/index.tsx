import { Routes, Route } from 'react-router-dom';
import OutputList from '../components/OutputList';
import OutputForm from '../components/OutputForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function OutputRoutes() {
    return (
        <Routes>
            <Route index element={<OutputList />} />
            <Route
                path="new"
                element={
                    <ProtectedRoute requiredPath="/output/new" requiredMethod="GET">
                        <OutputForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path=":id/edit"
                element={
                    <ProtectedRoute requiredPath="/output/:id/edit" requiredMethod="GET">
                        <OutputForm />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
