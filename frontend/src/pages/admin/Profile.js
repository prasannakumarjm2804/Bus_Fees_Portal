import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    // In this app, admin profile often doesn't have a separate table, 
    // it's just the user record.
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      // Assuming there's a route for this or we use a general one
      await axios.put('/auth/profile', form);
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
        <div className="profile-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{user?.name}</h2>
          <p>Administrator · {KEC_NAME}</p>
          <div className="profile-badges">
            <span className="badge badge-admin-reg">Administrator</span>
            <span className="badge badge-success">System Access Active</span>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.type === 'success' ? '✅ ' : '⚠️ '}{msg.text}
        </div>
      )}

      <div className="profile-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><span>👤</span> Administrator Info</h3>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} disabled title="Email change requires super-admin approval" />
              <small className="field-hint">Email is linked to your system identity.</small>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Admin Info'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><span>🔒</span> Security & Privacy</h3>
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
                <label>Confirm New Password</label>
                <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-outline" disabled={pwSaving}>
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="card" style={{ background: 'var(--surface2)' }}>
          <div className="card-header">
            <h3 className="card-title"><span>⚡</span> System Permissions</h3>
          </div>
          <div className="info-list">
            <div className="info-row"><span>User Management</span><strong>Full Access</strong></div>
            <div className="info-row"><span>Fee Collection</span><strong>Write Access</strong></div>
            <div className="info-row"><span>Route Config</span><strong>Read/Write</strong></div>
            <div className="info-row"><span>Security Logs</span><strong>Read Access</strong></div>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Your account has administrative privileges for the KEC Bus Fees Portal. 
            Keep your credentials secure.
          </div>
        </div>
      </div>
    </div>
  );
}

const KEC_NAME = 'Kongu Engineering College';
