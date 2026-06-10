import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Auth/LoginPage';
import Register from './pages/Auth/RegisterPage';
import ForgotPassword from './pages/Auth/ForgotPasswordPage';
import ResetPassword from './pages/Auth/ResetPasswordPage';

import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';

import ExercisesMainPage from './pages/Exercises/ExercisesMainPage';
import ExercisesCreatePage from './pages/Exercises/ExerciseCreatePage';
import ExerciseDetailPage from './pages/Exercises/ExerciseDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
        <Routes>

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>

              <Route path="/dashboard" element={<DashboardPage />} />
              
              <Route path="/exercises" element={<ExercisesMainPage />} />
              <Route path="/exercise/create" element={<ExercisesCreatePage />} />
              <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
              
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}