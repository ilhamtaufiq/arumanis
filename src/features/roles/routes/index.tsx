import { Route, Routes } from 'react-router-dom';
import RoleList from '../components/RoleList';
import RoleForm from '../components/RoleForm';

export const RoleRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<RoleList />} />
            <Route path="/new" element={<RoleForm />} />
            <Route path="/:id/edit" element={<RoleForm />} />
        </Routes>
    );
};
