import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Package,
  Settings,
  Sun,
  Wrench,
  X,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ROLE_LABEL } from '../format.js';

function navFor(role) {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/catalogue', label: 'Catalogue', icon: Car },
  ];
  if (role === 'MANUFACTURER') items.push({ to: '/manage', label: 'Vehicle management', icon: Wrench });
  if (role === 'MANUFACTURER' || role === 'SHOWROOM') items.push({ to: '/inventory', label: 'Inventory', icon: Package });
  items.push({
    to: '/enquiries',
    label: role === 'CUSTOMER' ? 'My enquiries' : 'Enquiries',
    icon: MessageSquare,
  });
  items.push({ to: '/profile', label: 'Profile & settings', icon: Settings });
  return items;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer after navigating.
  useEffect(() => setOpen(false), [location.pathname]);

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="shell">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-btn only-mobile" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="nav">
          {navFor(user.role).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user.fullName}</strong>
              <span>{ROLE_LABEL[user.role]}</span>
            </div>
          </div>
          <button className="btn btn-side" onClick={handleLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn only-mobile" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="topbar-title">
            <span className="eyebrow">{ROLE_LABEL[user.role]} workspace</span>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-btn theme-toggle"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="top-user">
              <div className="avatar avatar-sm">{initials}</div>
              <div className="top-user-text">
                <strong>{user.fullName}</strong>
                <span>{ROLE_LABEL[user.role]}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
