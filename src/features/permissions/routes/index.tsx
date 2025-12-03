import { Route, Routes } from 'react-router-dom';
import PermissionList from '../components/PermissionList';
import PermissionForm from '../components/PermissionForm';

export const PermissionRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PermissionList />} />
            <Route path="/new" element={<PermissionForm />} />
            <Route path="/:id/edit" element={<PermissionForm />} />
        </Routes>
    );
};
