import { Routes, Route } from 'react-router-dom';
import OutputList from '../components/OutputList';
import OutputForm from '../components/OutputForm';

export function OutputRoutes() {
    return (
        <Routes>
            <Route index element={<OutputList />} />
            <Route path="new" element={<OutputForm />} />
            <Route path=":id/edit" element={<OutputForm />} />
        </Routes>
    );
}
