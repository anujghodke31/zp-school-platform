import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import ToastNotification from './components/ToastNotification';
import CommandBar from './components/CommandBar';
import AIBot from './components/AIBot';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentPortal from './pages/ParentPortal';
import ELearning from './pages/ELearning';
import LandingPage from './pages/LandingPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <ToastNotification />
          <CommandBar />
          <AIBot />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/teacher/*" element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />

            <Route path="/parent/*" element={
              <ProtectedRoute allowedRoles={['Parent']}>
                <ParentPortal />
              </ProtectedRoute>
            } />

            <Route path="/elearning/*" element={
              <ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Parent']}>
                <ELearning />
              </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={<div className="p-8 text-white text-center mt-20"><h1>Unauthorized Access</h1><p>You do not have permission to view this page.</p></div>} />
            <Route path="*" element={<div className="p-8 text-white text-center mt-20"><h1>404 Not Found</h1></div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
