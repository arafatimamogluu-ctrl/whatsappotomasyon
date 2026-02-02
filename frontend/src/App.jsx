import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
// Placeholder pages
const Dashboard = () => <div className="text-2xl font-bold">Dashboard</div>;
const Connection = () => <div className="text-2xl font-bold">WhatsApp Bağlantısı</div>;
import Connection from './pages/Connection';
import Sender from './pages/Sender';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/connection" element={
              <ProtectedRoute>
                <Connection />
              </ProtectedRoute>
            } />

            <Route path="/sender" element={
              <ProtectedRoute>
                <Sender />
              </ProtectedRoute>
            } />

          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
