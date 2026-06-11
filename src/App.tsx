import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages

import Login from './pages/Auth/LoginPage';
import Register from './pages/Auth/RegisterPage';
import ForgotPassword from './pages/Auth/ForgotPasswordPage';
import ResetPassword from './pages/Auth/ResetPasswordPage';

// Main Layout & Dashboard

import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';

// Exercise Pages

import ExercisesMainPage from './pages/Exercises/ExercisesMainPage';
import ExercisesCreatePage from './pages/Exercises/ExerciseCreatePage';
import ExerciseDetailPage from './pages/Exercises/ExerciseDetailPage';
import ExerciseEditPage from './pages/Exercises/ExerciseEditPage';

// Food Pages

// import FoodsMainPage from './pages/Foods/FoodsMainPage';
// import FoodCreatePage from './pages/Foods/FoodCreatePage';
// import FoodDetailPage from './pages/Foods/FoodDetailPage';
// import FoodEditPage from './pages/Foods/FoodEditPage';

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

              // CRUD Exercises

              // Read All & Delete <Route path="/exercises" element={<ExercisesMainPage />} />
              // Create <Route path="/exercise/create" element={<ExercisesCreatePage />} />
              // Read <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
              // Update <Route path="/exercise/:id/edit" element={<ExerciseEditPage />} />

              // CRUD Foods

              {/* // Read All & Delete <Route path="/foods" element={<FoodsMainPage />} />
              // Create <Route path="/food/create" element={<FoodCreatePage />} />
              // Read <Route path="/food/:id" element={<FoodDetailPage />} />
              // Update <Route path="/food/edit/:id" element={<FoodEditPage />} /> */}
              
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}