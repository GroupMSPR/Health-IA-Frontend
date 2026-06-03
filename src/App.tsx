import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';

// Faux composants temporaires
const Dashboard = () => <div className="p-8 text-center text-2xl font-bold text-green-600">Tableau de bord super sécurisé ! 🔒</div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}