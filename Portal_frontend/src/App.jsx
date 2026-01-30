import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import RegisterSelect from './pages/RegisterSelect';
import StudentRegister from './pages/StudentRegister';
import ScribeRegister from './pages/ScribeRegister';
import AcceptRequest from './pages/scribe/AcceptRequest';
import SubmitFeedback from './pages/student/SubmitFeedback';
import ChatPage from './pages/shared/ChatPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VideoCall from './pages/shared/VideoCall';


// Helper component to protect routes
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  
  return <Layout userRole={user.role}>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        <Route path="/register-select" element={<RegisterSelect />} />
<Route path="/register/student" element={<StudentRegister />} />
<Route path="/register/scribe" element={<ScribeRegister />} />
        
        {/* Protected Student Routes */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold">Student Dashboard</h2>
                <p className="mt-2 text-slate-600">Welcome! Here you can create and manage exam requests.</p>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Protected Scribe Routes */}
        <Route 
          path="/scribe/dashboard" 
          element={
            <ProtectedRoute allowedRole="SCRIBE">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold">Scribe Dashboard</h2>
                <p className="mt-2 text-slate-600">Welcome! View your assigned bookings and manage availability.</p>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/accept-request" element={<AcceptRequest />} />
        <Route path="/chat/:requestId" element={<ChatPage />} />
        <Route 
  path="/student/feedback/:requestId" 
  element={
    <ProtectedRoute allowedRole="STUDENT">
      <SubmitFeedback />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
<Route path="/video/:requestId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
      </Routes>
      
    </AuthProvider>
  );
}

export default App;