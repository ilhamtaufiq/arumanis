import { Route, Routes } from 'react-router-dom';
import PenerimaList from '../components/PenerimaList';
import PenerimaForm from '../components/PenerimaForm';

export const PenerimaRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PenerimaList />} />
            <Route path="/new" element={<PenerimaForm />} />
            <Route path="/:id/edit" element={<PenerimaForm />} />
        </Routes>
    );
};
