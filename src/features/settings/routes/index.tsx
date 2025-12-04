import { Route, Routes } from 'react-router-dom';
import SettingsPage from '../components/SettingsPage';

export const SettingsRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<SettingsPage />} />
        </Routes>
    );
};
