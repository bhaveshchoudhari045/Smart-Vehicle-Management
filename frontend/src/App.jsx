import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import { Spinner } from './components/ui.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Catalogue from './pages/Catalogue.jsx';
import Manage from './pages/Manage.jsx';
import Inventory from './pages/Inventory.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Profile from './pages/Profile.jsx';

function RequireAuth({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  const { booting } = useAuth();
  if (booting) {
    return (
      <div className="boot">
        <Spinner label="Restoring your session..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/manage" element={<RequireAuth roles={['MANUFACTURER']}><Manage /></RequireAuth>} />
        <Route
          path="/inventory"
          element={<RequireAuth roles={['MANUFACTURER', 'SHOWROOM']}><Inventory /></RequireAuth>}
        />
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
