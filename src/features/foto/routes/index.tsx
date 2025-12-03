import { Route, Routes } from 'react-router-dom';
import FotoList from '../components/FotoList';
import FotoForm from '../components/FotoForm';

export const FotoRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<FotoList />} />
            <Route path="/new" element={<FotoForm />} />
            <Route path="/:id/edit" element={<FotoForm />} />
        </Routes>
    );
};
