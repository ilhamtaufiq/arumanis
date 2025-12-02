import { Route, Routes } from 'react-router-dom';
import KegiatanList from '../components/KegiatanList';
import KegiatanForm from '../components/KegiatanForm';

export const KegiatanRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<KegiatanList />} />
            <Route path="/new" element={<KegiatanForm />} />
            <Route path="/:id/edit" element={<KegiatanForm />} />
        </Routes>
    );
};
