import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import axios from 'axios';

const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'MBA', 'MCA', 'AIDS', 'AIML', 'CSD'];

export default function SignUp() {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    rollNumber: '', department: '', year: '', section: '',
    address: '', boardingPoint: '', routeId: '', parentName: '', parentPhone: '',
  });

  useEffect(() => {
    axios.get('/routes/public').then(r => setRoutes(r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.rollNumber) { setError('Roll Number is required.'); return; }
    if (!form.department) { setError('Please select your department.'); return; }
    if (!form.year) { setError('Please select your year.'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: 'student',
        rollNumber: form.rollNumber,
        department: form.department,
        year: form.year,
        section: form.section,
        address: form.address,
        boardingPoint: form.boardingPoint,
        routeId: form.routeId || null,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
      };
      const data = await register(payload);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Student Registration"
      subtitle="Create your KEC Bus Fees Portal account"
      footerLink={{ text: 'Already have an account?', to: '/login', label: 'Sign in' }}
    >
      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="form-section-title">Personal Information</div>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="As per college records" required />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile" maxLength={10} />
          </div>
        </div>

        <div className="form-group">
          <label>College Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rollno@kec.ac.in" required />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <div className="input-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min. 8 characters"
              required minLength={6}
            />
            <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Academic Info */}
        <div className="form-section-title">Academic Details</div>
        <div className="form-row">
          <div className="form-group">
            <label>Roll Number *</label>
            <input value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} placeholder="e.g. 22CSE001" required />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <select value={form.department} onChange={e => set('department', e.target.value)} required>
              <option value="">Select department</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Year *</label>
            <select value={form.year} onChange={e => set('year', e.target.value)} required>
              <option value="">Select year</option>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Section</label>
            <input value={form.section} onChange={e => set('section', e.target.value)} placeholder="e.g. A, B, C" />
          </div>
        </div>

        {/* Transport Info */}
        <div className="form-section-title">Transport Details</div>
        <div className="form-group">
          <label>Bus Route</label>
          <select value={form.routeId} onChange={e => set('routeId', e.target.value)}>
            <option value="">Select route (can be assigned later by admin)</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                Route {r.routeNumber} — {r.routeName} (₹{r.monthlyFee}/month)
              </option>
            ))}
          </select>
          <small className="field-hint">If your route is not listed, admin will assign it after verification.</small>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Boarding Point</label>
            <input value={form.boardingPoint} onChange={e => set('boardingPoint', e.target.value)} placeholder="Where you board the bus" />
          </div>
          <div className="form-group">
            <label>Home Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Town / City" />
          </div>
        </div>

        {/* Parent Info */}
        <div className="form-section-title">Parent / Guardian Details</div>
        <div className="form-row">
          <div className="form-group">
            <label>Parent Name</label>
            <input value={form.parentName} onChange={e => set('parentName', e.target.value)} placeholder="Parent / Guardian name" />
          </div>
          <div className="form-group">
            <label>Parent Phone</label>
            <input value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} placeholder="Parent mobile number" maxLength={10} />
          </div>
        </div>

        <div className="auth-help">
          <strong>Note</strong>
          Your bus route and fee schedule may be assigned by the Transportation Department after registration.
        </div>

        <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? <><span className="spinner spinner-sm" /> Creating account...</> : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
