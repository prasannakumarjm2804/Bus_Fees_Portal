import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ name: '', phone: '', address: '', boardingPoint: '', parentPhone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    axios.get('/students/profile')
      .then(r => {
        setProfile(r.data);
        setForm({
          name: r.data.user?.name || '',
          phone: r.data.user?.phone || '',
          address: r.data.address || '',
          boardingPoint: r.data.boardingPoint || '',
          parentPhone: r.data.parentPhone || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      // First update the user details (name, phone)
      await axios.put('/auth/profile', { name: form.name, phone: form.phone });
      // Then update student-specific details
      const r = await axios.put('/students/profile', {
        address: form.address,
        boardingPoint: form.boardingPoint,
        parentPhone: form.parentPhone
      });
      setProfile(r.data.profile);
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPwSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await axios.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar-lg">{form.name?.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{form.name}</h2>
          <p>{profile?.studentId} · {profile?.department} · Year {profile?.year}</p>
          <div className="profile-badges">
            <span className="kec-badge">Student</span>
            {profile?.route && <span className="badge badge-route">Route {profile.route.routeNumber}</span>}
            <span className="badge badge-paid">Active</span>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      <div className="profile-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Personal & Contact Info</h3>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Parent Phone</label>
                <input value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Boarding Point</label>
              <input value={form.boardingPoint} onChange={e => setForm({ ...form, boardingPoint: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Current Address</label>
              <textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Security Settings</h3>
          </div>
          <form onSubmit={handlePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-outline" disabled={pwSaving}>
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Academic Details</h3>
            <span className="readonly-tag">Verified</span>
          </div>
          <div className="info-list">
            {[
              ['Student ID', profile?.studentId],
              ['Roll Number', profile?.rollNumber],
              ['Department', profile?.department],
              ['Year / Section', `Year ${profile?.year} · Section ${profile?.section || 'N/A'}`],
              ['Email Address', profile?.user?.email],
              ['Parent Name', profile?.parentName],
              ['Enrollment Date', profile?.admissionDate],
            ].map(([k, v]) => (
              <div className="info-row" key={k}><span>{k}</span><strong>{v || '—'}</strong></div>
            ))}
          </div>
        </div>

        {profile?.route && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Transport Details</h3>
            </div>
            <div className="route-visual" style={{ marginBottom: 20 }}>
              <div className="route-stop"><span>Origin</span><strong>{profile.route.startPoint}</strong></div>
              <div className="route-line" />
              <div className="route-stop route-stop-mid"><span>Boarding</span><strong>{form.boardingPoint || '—'}</strong></div>
              <div className="route-line" />
              <div className="route-stop"><span>Destination</span><strong>{profile.route.endPoint}</strong></div>
            </div>
            <div className="info-list">
              <div className="info-row"><span>Assigned Route</span><strong>{profile.route.routeNumber} — {profile.route.routeName}</strong></div>
              <div className="info-row"><span>Monthly Bus Fee</span><strong className="text-primary">₹{Number(profile.route.monthlyFee).toLocaleString('en-IN')}</strong></div>
              <div className="info-row"><span>Distance</span><strong>{profile.route.distanceKm} km</strong></div>
              <div className="info-row"><span>Fee Cycle</span><strong className="capitalize">{profile.feeType}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
