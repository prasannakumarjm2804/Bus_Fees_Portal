import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const role = isAdmin ? 'admin' : 'student';
    try {
      const data = await login(email, password, role, isAdmin ? adminSecret : undefined);
      if (isAdmin && data.user.role !== 'admin') {
        logout();
        setError('This account is not registered as an administrator.');
        return;
      }
      if (!isAdmin && data.user.role !== 'student') {
        logout();
        setError('This account is not registered as a student.');
        return;
      }
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your student or administrator account"
      footerLink={{ text: 'New student?', to: '/signup', label: 'Register here' }}
    >
      <div className="role-tabs">
        <button
          type="button"
          className={`role-tab ${!isAdmin ? 'active' : ''}`}
          onClick={() => { setIsAdmin(false); setError(''); }}
        >
          Student
        </button>
        <button
          type="button"
          className={`role-tab ${isAdmin ? 'active' : ''}`}
          onClick={() => { setIsAdmin(true); setError(''); }}
        >
          Administrator
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>College Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={isAdmin ? 'admin@kec.ac.in' : 'rollno@kec.ac.in'}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="input-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="form-group">
            <label>Administrator Access Code</label>
            <input
              type="password"
              value={adminSecret}
              onChange={e => setAdminSecret(e.target.value)}
              placeholder="Enter access code"
              required
            />
            <small className="field-hint">Required for administrator sign in.</small>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
          {loading ? (
            <><span className="spinner spinner-sm" /> Signing in...</>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-help">
        <strong>Need help?</strong>
        Contact the Transportation Department at{' '}
        <a href="mailto:transport@kec.ac.in">transport@kec.ac.in</a>
      </div>
    </AuthLayout>
  );
}
