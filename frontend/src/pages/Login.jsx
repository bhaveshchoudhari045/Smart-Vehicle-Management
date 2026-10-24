import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Truck,
  Warehouse,
  User as UserIcon,
} from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Moon, Sun } from "lucide-react";

const DEMOS = [
  {
    role: "Manufacturer",
    email: "manufacturer@autobridge.com",
    password: "Maker@123",
    icon: Truck,
    note: "Manage vehicles",
  },
  {
    role: "Showroom Owner",
    email: "bhavesh341377@gmail.com",
    password: "Show@123",
    icon: Warehouse,
    note: "Stock & sales",
  },
  {
    role: "Customer",
    email: "customer@autobridge.com",
    password: "Buyer@123",
    icon: UserIcon,
    note: "Browse & enquire",
  },
];

export default function Login() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [heroOk, setHeroOk] = useState(true);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function fill(d) {
    setEmail(d.email);
    setPassword(d.password);
    setError("");
  }

  return (
    <div className="auth">
      <section className="auth-hero">
        {heroOk && (
          <img
            src="https://loremflickr.com/1400/1000/sportscar,night?lock=21"
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setHeroOk(false)}
          />
        )}
        <div className="auth-hero-shade" />
        <div className="auth-hero-inner">
          <Logo size={44} />
          <div>
            <span className="eyebrow">Smart Vehicle Management</span>
            <h2>From the factory floor to the showroom door.</h2>
            <p>
              One workspace for manufacturers, showroom owners and customers to
              manage vehicles, stock and enquiries.
            </p>
            <ul className="hero-points">
              <li>
                <ShieldCheck size={16} /> Role-based access, secured by a Java
                Spring Boot API
              </li>
              <li>
                <ShieldCheck size={16} /> Live inventory, enquiries and
                dashboard insights
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <button
          className="icon-btn auth-theme"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="auth-card">
          <div className="only-mobile auth-mobile-logo">
            <Logo />
          </div>
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in to AutoBridge</h1>
          <p className="muted">
            Use your account, or pick a demo account below.
          </p>

          <form onSubmit={submit} noValidate>
            <label className="field">
              <span>Email</span>
              <div className="input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="input-wrap">
                <Lock size={17} />
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New customer? <Link to="/register">Create an account</Link>
          </p>

          <div className="demo-panel">
            <div className="demo-title">
              Demo accounts <span>click to fill</span>
            </div>
            <div className="demo-grid">
              {DEMOS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  className="demo-card"
                  onClick={() => fill(d)}
                >
                  <d.icon size={18} />
                  <strong>{d.role}</strong>
                  <span>{d.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
