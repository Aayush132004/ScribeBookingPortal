// Portal_frontend/src/components/GuestRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const GuestRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    // If logged in, redirect away from Login/Register
    if (user) {
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/scribe/dashboard" replace />;
    }

    return <Outlet />;
};