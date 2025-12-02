import { Route, Routes } from 'react-router-dom';
import PekerjaanList from '../components/PekerjaanList';
import PekerjaanForm from '../components/PekerjaanForm';

export const PekerjaanRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PekerjaanList />} />
            <Route path="/new" element={<PekerjaanForm />} />
            <Route path="/:id/edit" element={<PekerjaanForm />} />
        </Routes>
    );
};

