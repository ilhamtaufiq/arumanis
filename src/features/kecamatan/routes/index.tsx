import { Route, Routes } from 'react-router-dom';
import KecamatanList from '../components/KecamatanList';
import KecamatanForm from '../components/KecamatanForm';

export const KecamatanRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<KecamatanList />} />
            <Route path="/new" element={<KecamatanForm />} />
            <Route path="/:id/edit" element={<KecamatanForm />} />
        </Routes>
    );
};
