import { Route, Routes } from 'react-router-dom';
import Dashboard from '../components/Dashboard';

export const DashboardRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
        </Routes>
    );
};
