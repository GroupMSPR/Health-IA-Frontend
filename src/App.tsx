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
import StatisticsPage from './pages/StatisticsPage';

// Health Metrics

import HealthMetricsMainPage from './pages/HealthMetrics/HealthMetricsMainPage';
import HealthMetricsDetailPage from './pages/HealthMetrics/HealthMetricsDetailPage';
import HealthMetricsCreatePage from './pages/HealthMetrics/HealthMetricsCreatePage';
import HealthMetricsEditPage from './pages/HealthMetrics/HealthMetricsEditPage';

// Exercise Pages

import ExercisesMainPage from './pages/Exercises/ExercisesMainPage';
import ExercisesCreatePage from './pages/Exercises/ExerciseCreatePage';
import ExerciseDetailPage from './pages/Exercises/ExerciseDetailPage';
import ExerciseEditPage from './pages/Exercises/ExerciseEditPage';
import ExercisesRecommendsIAPage from './pages/Exercises/ExercisesRecommendsIAPage';

// Food Pages

import FoodsMainPage from './pages/Foods/FoodsMainPage';
import FoodCreatePage from './pages/Foods/FoodCreatePage';
import FoodDetailPage from './pages/Foods/FoodDetailPage';
import FoodEditPage from './pages/Foods/FoodEditPage';
import FoodScanIAPage from './pages/Foods/FoodScanIAPage';
import FoodScanIAResultPage from './pages/Foods/FoodScanIAResultPage';

// Account Pages

import ProfilePage from './pages/Account/ProfilePage';
import SettingsPage from './pages/Account/SettingsPage';

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

            // ====================== Main ====================== //

              // Dashboard <Route path="/dashboard" element={<DashboardPage />} />
              // Statistics <Route path="/statistics" element={<StatisticsPage />} />
              // My Metrics <Route path="/my-metrics" element={<HealthMetricsMainPage />} />

            // ====================== Health Metrics ====================== //

              // Create <Route path='/health-metric/create' element={<HealthMetricsCreatePage />} />
              // Read <Route path="/health-metric/:id" element={<HealthMetricsDetailPage />} />
              // Create <Route path='/health-metric/:id/edit' element={<HealthMetricsEditPage />} />

            // ====================== Exercises ====================== //

              // Read All & Delete <Route path="/exercises" element={<ExercisesMainPage />} />
              // Create <Route path="/exercise/create" element={<ExercisesCreatePage />} />
              // Read <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
              // Update <Route path="/exercise/:id/edit" element={<ExerciseEditPage />} />

              // Moteur de Recommendation IA <Route path="/exercises-recommendations" element={<ExercisesRecommendsIAPage />} />

            // ====================== Foods ====================== //

              // Read All & Delete <Route path="/foods" element={<FoodsMainPage />} />
              // Create <Route path="/food/create" element={<FoodCreatePage />} />
              // Read <Route path="/food/:id" element={<FoodDetailPage />} />
              // Update <Route path="/food/:id/edit/" element={<FoodEditPage />} />

              // Scan Food IA <Route path="/food-scan" element={<FoodScanIAPage />} />
              // Scan Result <Route path="/food-scan/result" element={<FoodScanIAResultPage />} />

            // ====================== Account ====================== //

              // Profile <Route path="/account/profile" element={<ProfilePage />} />
              // Settings <Route path="/account/settings" element={<SettingsPage />} />
              
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}