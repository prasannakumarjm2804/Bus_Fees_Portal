import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminConcessions() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const q = filter ? `?status=${filter}` : '';
    axios.get(`/concessions${q}`)
      .then(r => setRequests(r.data.requests || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleReview = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.put(`/concessions/${selected.id}/review`, { status, adminNotes: notes });
      setSelected(null);
      setNotes('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
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
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Concession Requests</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state"><h3>No requests</h3><p>Student concession applications will appear here.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Type</th><th>Discount</th><th>Reason</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.student?.user?.name || '—'}</strong><br /><span className="text-muted" style={{ fontSize: 11 }}>{r.student?.studentId}</span></td>
                    <td className="capitalize">{r.concessionType.replace('_', ' ')}</td>
                    <td>{r.requestedPercent}%</td>
                    <td style={{ maxWidth: 200 }}>{r.reason?.slice(0, 80)}{r.reason?.length > 80 ? '...' : ''}</td>
                    <td><span className={`badge badge-${r.status === 'approved' ? 'paid' : r.status === 'rejected' ? 'overdue' : 'pending'}`}>{r.status}</span></td>
                    <td className="text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      {r.status === 'pending' && (
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelected(r); setNotes(''); }}>Review</button>
                      )}
                    </td>
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
              <h3>Review Concession - {selected.student?.user?.name}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>X</button>
            </div>
            <div className="modal-body">
              <p><strong>Type:</strong> <span className="capitalize">{selected.concessionType.replace('_', ' ')}</span></p>
              <p><strong>Requested:</strong> {selected.requestedPercent}% discount</p>
              <p style={{ margin: '12px 0' }}>{selected.reason}</p>
              <div className="form-group">
                <label>Admin Notes (optional)</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for the student..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleReview('rejected')} disabled={saving}>Reject</button>
              <button className="btn btn-success btn-sm" onClick={() => handleReview('approved')} disabled={saving}>Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
