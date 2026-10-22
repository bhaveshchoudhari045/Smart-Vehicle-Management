import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { api } from '../api.js';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.fullName.trim().length < 2) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setBusy(true);
    try {
      await api.register(form.fullName.trim(), form.email.trim(), form.password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth auth-single">
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo /></div>

          {done ? (
            <div className="success-card">
              <CheckCircle2 size={46} />
              <h1>Account created</h1>
              <p className="muted">
                Your customer account for <strong>{form.email.trim()}</strong> is ready. You can sign in now.
              </p>
              <Link className="btn btn-primary btn-block" to="/">Go to sign in</Link>
            </div>
          ) : (
            <>
              <span className="eyebrow">Customer registration</span>
              <h1>Create your account</h1>
              <p className="muted">
                Public registration is for customers only. Manufacturer and showroom accounts are set up by the platform.
              </p>

              <form onSubmit={submit} noValidate>
                <label className="field">
                  <span>Full name</span>
                  <div className="input-wrap">
                    <UserIcon size={17} />
                    <input value={form.fullName} onChange={set('fullName')} placeholder="Your full name" autoComplete="name" />
                  </div>
                </label>

                <label className="field">
                  <span>Email</span>
                  <div className="input-wrap">
                    <Mail size={17} />
                    <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
                  </div>
                </label>

                <label className="field">
                  <span>Role</span>
                  <div className="input-wrap input-static">
                    <UserIcon size={17} />
                    <input value="Customer" disabled readOnly />
                  </div>
                </label>

                <label className="field">
                  <span>Password</span>
                  <div className="input-wrap">
                    <Lock size={17} />
                    <input
                      type={show ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>

                <label className="field">
                  <span>Confirm password</span>
                  <div className="input-wrap">
                    <Lock size={17} />
                    <input
                      type={show ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={set('confirm')}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                  </div>
                </label>

                {error && <div className="alert alert-error" role="alert">{error}</div>}

                <button className="btn btn-primary btn-block" disabled={busy}>
                  {busy ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="auth-switch">
                Already registered? <Link to="/">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
