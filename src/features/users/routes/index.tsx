import { Route, Routes } from 'react-router-dom';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';

export const UserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/new" element={<UserForm />} />
            <Route path="/:id/edit" element={<UserForm />} />
        </Routes>
    );
};
