import { Routes, Route } from 'react-router-dom';
import KontrakList from '../components/KontrakList';
import KontrakForm from '../components/KontrakForm';

export function KontrakRoutes() {
    return (
        <Routes>
            <Route index element={<KontrakList />} />
            <Route path="new" element={<KontrakForm />} />
            <Route path=":id/edit" element={<KontrakForm />} />
        </Routes>
    );
}
