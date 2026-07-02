import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminRoutes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ routeNumber: '', routeName: '', startPoint: '', endPoint: '', stops: '', distanceKm: '', monthlyFee: '', termFee: '', annualFee: '' });

  const fetchRoutes = () => axios.get('/routes').then(r => setRoutes(r.data));
  useEffect(() => { fetchRoutes(); }, []);

  const openCreate = () => { setEditRoute(null); setForm({ routeNumber: '', routeName: '', startPoint: '', endPoint: '', stops: '', distanceKm: '', monthlyFee: '', termFee: '', annualFee: '' }); setShowModal(true); };
  const openEdit = (r) => { setEditRoute(r); setForm({ routeNumber: r.routeNumber, routeName: r.routeName, startPoint: r.startPoint, endPoint: r.endPoint, stops: r.stops || '', distanceKm: r.distanceKm || '', monthlyFee: r.monthlyFee, termFee: r.termFee || '', annualFee: r.annualFee || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRoute) { await axios.put(`/routes/${editRoute.id}`, form); setMsg('Route updated!'); }
      else { await axios.post('/routes', form); setMsg('Route created!'); }
      setShowModal(false); fetchRoutes();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => { if (window.confirm('Deactivate route?')) { await axios.delete(`/routes/${id}`); fetchRoutes(); } };

  return (
    <div>
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>
      {msg && <div className="alert alert-success" onClick={() => setMsg('')}>{msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={openCreate}>Add Route</button>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Bus Routes ({routes.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Route No.</th><th>Route Name</th><th>From → To</th><th>Distance</th><th>Monthly Fee</th><th>Term Fee</th><th>Students</th><th>Actions</th></tr></thead>
            <tbody>
              {routes.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><p>No routes added yet</p></div></td></tr>
              ) : routes.map(r => (
                <tr key={r.id}>
                  <td><strong style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>{r.routeNumber}</strong></td>
                  <td>{r.routeName}</td>
                  <td style={{ fontSize: 12 }}>{r.startPoint} → {r.endPoint}</td>
                  <td>{r.distanceKm ? `${r.distanceKm} km` : '—'}</td>
                  <td><strong style={{ color: 'var(--success)' }}>₹{Number(r.monthlyFee).toLocaleString()}</strong></td>
                  <td>{r.termFee ? `₹${Number(r.termFee).toLocaleString()}` : '—'}</td>
                  <td><span className="badge" style={{ background: '#f0fdf4', color: '#15803d' }}>{r.studentCount || 0}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Deactivate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editRoute ? 'Edit Route' : 'Add New Route'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Route Number *</label><input placeholder="e.g. R01" value={form.routeNumber} onChange={e => setForm({ ...form, routeNumber: e.target.value })} required /></div>
                <div className="form-group"><label>Route Name *</label><input placeholder="e.g. City Center Route" value={form.routeName} onChange={e => setForm({ ...form, routeName: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Point *</label><input placeholder="College" value={form.startPoint} onChange={e => setForm({ ...form, startPoint: e.target.value })} required /></div>
                <div className="form-group"><label>End Point *</label><input placeholder="Final stop" value={form.endPoint} onChange={e => setForm({ ...form, endPoint: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Distance (km)</label><input type="number" step="0.1" value={form.distanceKm} onChange={e => setForm({ ...form, distanceKm: e.target.value })} /></div>
                <div className="form-group"><label>Monthly Fee (₹) *</label><input type="number" value={form.monthlyFee} onChange={e => setForm({ ...form, monthlyFee: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Term Fee (₹)</label><input type="number" value={form.termFee} onChange={e => setForm({ ...form, termFee: e.target.value })} /></div>
                <div className="form-group"><label>Annual Fee (₹)</label><input type="number" value={form.annualFee} onChange={e => setForm({ ...form, annualFee: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Stops (comma-separated)</label><textarea rows={2} placeholder="Stop 1, Stop 2, Stop 3..." value={form.stops} onChange={e => setForm({ ...form, stops: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editRoute ? 'Update Route' : 'Add Route'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
