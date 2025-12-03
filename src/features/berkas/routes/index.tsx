import { Route, Routes } from 'react-router-dom';
import BerkasList from '../components/BerkasList';
import BerkasForm from '../components/BerkasForm';

export const BerkasRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<BerkasList />} />
            <Route path="/new" element={<BerkasForm />} />
            <Route path="/:id/edit" element={<BerkasForm />} />
        </Routes>
    );
};
