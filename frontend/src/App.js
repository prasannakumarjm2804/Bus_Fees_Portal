import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminRoutes from './pages/admin/Routes';
import AdminFees from './pages/admin/Fees';
import AdminSchedules from './pages/admin/Schedules';
import AdminUpcoming from './pages/admin/Upcoming';
import AdminOverdue from './pages/admin/Overdue';
import AdminProfile from './pages/admin/Profile';
import AdminReports from './pages/admin/Reports';
import AdminSupport from './pages/admin/Support';
import AdminConcessions from './pages/admin/Concessions';
import StudentDashboard from './pages/student/Dashboard';
import StudentFees from './pages/student/Fees';
import StudentSchedule from './pages/student/Schedule';
import StudentProfile from './pages/student/Profile';
import StudentNotifications from './pages/student/Notifications';
import StudentBusPass from './pages/student/BusPass';
import StudentSupport from './pages/student/Support';
import StudentConcessions from './pages/student/Concessions';
import Layout from './components/shared/Layout';
import './App.css';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /><p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/student/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} /> : <SignUp />} />
      <Route path="/admin" element={<PrivateRoute adminOnly><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="routes" element={<AdminRoutes />} />
        <Route path="fees" element={<AdminFees />} />
        <Route path="schedules" element={<AdminSchedules />} />
        <Route path="upcoming" element={<AdminUpcoming />} />
        <Route path="overdue" element={<AdminOverdue />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="concessions" element={<AdminConcessions />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
      <Route path="/student" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="bus-pass" element={<StudentBusPass />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="concessions" element={<StudentConcessions />} />
        <Route path="support" element={<StudentSupport />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
