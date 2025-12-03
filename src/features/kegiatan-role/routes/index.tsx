import { Route, Routes } from 'react-router-dom';
import KegiatanRoleList from '../components/KegiatanRoleList';
import KegiatanRoleForm from '../components/KegiatanRoleForm';

export const KegiatanRoleRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<KegiatanRoleList />} />
            <Route path="/new" element={<KegiatanRoleForm />} />
        </Routes>
    );
};

