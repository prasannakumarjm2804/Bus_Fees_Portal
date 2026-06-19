import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CATEGORIES = [
  { value: 'fee', label: 'Fee Related' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'route', label: 'Route Change' },
  { value: 'pass', label: 'Bus Pass' },
  { value: 'other', label: 'Other' },
];

export default function StudentSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', category: 'other' });
  const [msg, setMsg] = useState('');

  const loadTickets = () => {
    axios.get('/support/my')
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      await axios.post('/support', form);
      setForm({ subject: '', message: '', category: 'other' });
      setShowForm(false);
      setMsg('Ticket submitted successfully. Our team will respond shortly.');
      loadTickets();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Help & Support</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Ticket'}
          </button>
        </div>
        <p className="text-muted" style={{ marginBottom: showForm ? 16 : 0 }}>
          Submit queries about fees, payments, routes, or bus pass issues. Transportation office will respond within 2–3 working days.
        </p>

        {showForm && (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief description" required />
              </div>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue in detail..." required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">My Tickets ({tickets.length})</h3></div>
        {tickets.length === 0 ? (
          <div className="empty-state">
            <h3>No support tickets</h3>
            <p>Click "New Ticket" to reach the transportation office.</p>
          </div>
        ) : (
          <div className="ticket-list">
            {tickets.map(t => (
              <div className="ticket-item" key={t.id}>
                <div className="ticket-item-header">
                  <div>
                    <strong>{t.subject}</strong>
                    <span className="text-muted" style={{ marginLeft: 8, fontSize: 12 }}>#{t.id}</span>
                  </div>
                  <span className={`badge badge-${t.status === 'resolved' || t.status === 'closed' ? 'paid' : t.status === 'in_progress' ? 'pending' : 'overdue'}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="ticket-message">{t.message}</p>
                <div className="ticket-meta">
                  <span className="capitalize">{t.category}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {t.adminResponse && (
                  <div className="ticket-response">
                    <label>Admin Response</label>
                    <p>{t.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
