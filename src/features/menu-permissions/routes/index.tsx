import { Route, Routes } from 'react-router-dom';
import MenuPermissionList from '../components/MenuPermissionList';
import MenuPermissionForm from '../components/MenuPermissionForm';

export const MenuPermissionRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MenuPermissionList />} />
            <Route path="/new" element={<MenuPermissionForm />} />
            <Route path="/:id/edit" element={<MenuPermissionForm />} />
        </Routes>
    );
};
