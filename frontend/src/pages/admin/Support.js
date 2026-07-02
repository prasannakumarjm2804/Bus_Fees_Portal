import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminSupport() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const q = filter ? `?status=${filter}` : '';
    Promise.all([
      axios.get(`/support${q}`),
      axios.get('/support/stats'),
    ]).then(([t, s]) => {
      setTickets(t.data.tickets || []);
      setStats(s.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.put(`/support/${selected.id}`, { status, adminResponse: response });
      setSelected(null);
      setResponse('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>
      {stats && (
        <div className="stats-grid stats-grid-3">
          <div className="stat-card yellow"><div className="stat-label">Open</div><div className="stat-value">{stats.open}</div></div>
          <div className="stat-card blue"><div className="stat-label">In Progress</div><div className="stat-value">{stats.inProgress}</div></div>
          <div className="stat-card green"><div className="stat-label">Resolved</div><div className="stat-value">{stats.resolved}</div></div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Support Tickets</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state"><h3>No tickets</h3><p>Student support requests will appear here.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Student</th><th>Subject</th><th>Category</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td><strong>{t.user?.name || t.student?.user?.name || '—'}</strong></td>
                    <td>{t.subject}</td>
                    <td className="capitalize">{t.category}</td>
                    <td><span className={`badge badge-${t.status === 'resolved' || t.status === 'closed' ? 'paid' : 'pending'}`}>{t.status.replace('_', ' ')}</span></td>
                    <td className="text-muted">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => { setSelected(t); setResponse(t.adminResponse || ''); setStatus(t.status === 'open' ? 'in_progress' : t.status); }}>Respond</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ticket #{selected.id}: {selected.subject}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>X</button>
            </div>
            <div className="modal-body">
              <p className="text-muted" style={{ marginBottom: 12 }}>{selected.message}</p>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Response to Student</label>
                <textarea rows={4} value={response} onChange={e => setResponse(e.target.value)} placeholder="Write your response..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update Ticket'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
