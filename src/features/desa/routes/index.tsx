import { Route, Routes } from 'react-router-dom';
import DesaList from '../components/DesaList';
import DesaForm from '../components/DesaForm';

export const DesaRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DesaList />} />
            <Route path="/new" element={<DesaForm />} />
            <Route path="/:id/edit" element={<DesaForm />} />
        </Routes>
    );
};
