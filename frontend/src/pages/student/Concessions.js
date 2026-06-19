import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TYPES = [
  { value: 'scholarship', label: 'Merit Scholarship' },
  { value: 'financial', label: 'Financial Hardship' },
  { value: 'sibling', label: 'Sibling Discount' },
  { value: 'staff_child', label: 'Staff Child' },
  { value: 'other', label: 'Other' },
];

export default function StudentConcessions() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ concessionType: 'financial', requestedPercent: 25, reason: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    axios.get('/concessions/my')
      .then(r => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const hasPending = requests.some(r => r.status === 'pending');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      await axios.post('/concessions', form);
      setForm({ concessionType: 'financial', requestedPercent: 25, reason: '' });
      setShowForm(false);
      setMsg('Concession request submitted for admin review.');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      {msg && <div className={`alert ${msg.includes('submitted') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Fee Concession Request</h3>
          {!hasPending && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Apply for Concession'}
            </button>
          )}
        </div>
        <p className="text-muted">
          Students facing financial hardship or eligible for institutional concessions may apply here. Approved concessions are applied to future fee records.
        </p>

        {hasPending && (
          <div className="alert alert-info" style={{ marginTop: 12 }}>
            You have a pending concession request under review.
          </div>
        )}

        {showForm && !hasPending && (
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Concession Type</label>
                <select value={form.concessionType} onChange={e => setForm({ ...form, concessionType: e.target.value })}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Requested Discount (%)</label>
                <input type="number" min={5} max={75} value={form.requestedPercent}
                  onChange={e => setForm({ ...form, requestedPercent: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Reason / Supporting Details</label>
              <textarea rows={4} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Explain your eligibility and attach any reference details..." required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Request History</h3></div>
        {requests.length === 0 ? (
          <div className="empty-state">
            <h3>No concession requests</h3>
            <p>Apply if you are eligible for a bus fee concession.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>Discount</th><th>Status</th><th>Submitted</th><th>Admin Notes</th></tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td className="capitalize">{r.concessionType.replace('_', ' ')}</td>
                    <td>{r.requestedPercent}%</td>
                    <td><span className={`badge badge-${r.status === 'approved' ? 'paid' : r.status === 'rejected' ? 'overdue' : 'pending'}`}>{r.status}</span></td>
                    <td className="text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="text-muted">{r.adminNotes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
