import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Badge, PageHeader } from '../components/ui.jsx';
import { ROLE_LABEL, formatDate } from '../format.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [health, setHealth] = useState({ state: 'checking' });

  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then((h) => !cancelled && setHealth({ state: 'up', ...h }))
      .catch(() => !cancelled && setHealth({ state: 'down' }));
    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut() {
    await logout();
    navigate('/', { replace: true });
  }

  const initials = user.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile & settings" subtitle="Your account details, appearance and application information." />

      <div className="grid-2">
        <section className="card">
          <div className="profile-head">
            <div className="avatar avatar-lg">{initials}</div>
            <div>
              <h3>{user.fullName}</h3>
              <Badge tone="info">{ROLE_LABEL[user.role]}</Badge>
            </div>
          </div>
          <dl className="facts facts-col">
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Role</dt><dd>{ROLE_LABEL[user.role]}</dd></div>
            <div><dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd></div>
          </dl>
          <button className="btn btn-ghost" onClick={signOut}><LogOut size={17} /> Sign out</button>
        </section>

        <section className="card">
          <h3>Appearance</h3>
          <p className="muted">Your choice is saved in this browser.</p>
          <div className="theme-options">
            <button className={`theme-option ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme('dark')}>
              <Moon size={20} /> <strong>Dark</strong> <span>Midnight navy</span>
            </button>
            <button className={`theme-option ${theme === 'light' ? 'on' : ''}`} onClick={() => setTheme('light')}>
              <Sun size={20} /> <strong>Light</strong> <span>Warm cream</span>
            </button>
          </div>
        </section>
      </div>

      <section className="card section">
        <h3>About this application</h3>
        <dl className="facts">
          <div><dt>Application</dt><dd>AutoBridge Lite 1.0</dd></div>
          <div><dt>Backend</dt><dd>Java 21 - Spring Boot - Spring Security - JPA</dd></div>
          <div><dt>Database</dt><dd>H2 (file based)</dd></div>
          <div><dt>Frontend</dt><dd>React - Vite</dd></div>
          <div>
            <dt>Backend status</dt>
            <dd>
              {health.state === 'checking' && 'Checking...'}
              {health.state === 'up' && <Badge tone="good">Online - Java {health.java}</Badge>}
              {health.state === 'down' && <Badge tone="bad">Unreachable</Badge>}
            </dd>
          </div>
        </dl>
        <p className="muted small">Vehicle data, prices and specifications are illustrative demo data for an academic project.</p>
      </section>
    </>
  );
}
