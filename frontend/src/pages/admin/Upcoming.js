import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminUpcoming() {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState([]);
  const [msg, setMsg] = useState({ text:'', type:'' });

  useEffect(() => {
    axios.get('/schedules/upcoming').then(r => setFees(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const notify = (text, type='success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text:'', type:'' }), 4000); };

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === fees.length ? [] : fees.map(f => f.id));

  const sendReminders = async () => {
    if (selected.length === 0) return notify('Select at least one student', 'error');
    setSending(true);
    try {
      const r = await axios.post('/schedules/reminders', { feeIds: selected });
      notify(r.data.message);
      setSelected([]);
    } catch { notify('Failed to send reminders', 'error'); }
    finally { setSending(false); }
  };

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000*60*60*24));
  };

  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;

  if (loading) return <div className="loading-screen" style={{ height:300 }}><div className="spinner" /></div>;

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div className="alert alert-warning" style={{ flex:1, marginBottom:0 }}>
          Showing {fees.length} fees due in the next 30 days
        </div>
        {selected.length > 0 && (
          <button className="btn btn-warning" onClick={sendReminders} disabled={sending}>
            {sending ? 'Sending...' : `Send Reminder (${selected.length})`}
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upcoming Due Fees</h3>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-outline btn-sm" onClick={toggleAll}>{selected.length === fees.length ? 'Deselect All' : 'Select All'}</button>
          </div>
        </div>
        {fees.length === 0 ? (
          <div className="empty-state"><h3>No upcoming dues</h3><p>All fees are up to date for the next 30 days</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th><input type="checkbox" onChange={toggleAll} checked={selected.length === fees.length && fees.length > 0} /></th><th>Student</th><th>Route</th><th>Month</th><th>Amount</th><th>Due Date</th><th>Days Left</th><th>Action</th></tr></thead>
              <tbody>
                {fees.map(f => {
                  const days = daysUntil(f.dueDate);
                  return (
                    <tr key={f.id}>
                      <td><input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggle(f.id)} /></td>
                      <td>
                        <div style={{ fontWeight:600 }}>{f.student?.user?.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{f.student?.studentId}</div>
                      </td>
                      <td><span style={{ background:'#dbeafe', color:'#1d4ed8', padding:'2px 8px', borderRadius:20, fontSize:12, fontWeight:700 }}>{f.route?.routeNumber}</span></td>
                      <td>{f.feeMonth}</td>
                      <td><strong>{fmt(f.totalAmount)}</strong></td>
                      <td style={{ fontSize:12 }}>{f.dueDate}</td>
                      <td>
                        <span style={{ background: days <= 3 ? '#fee2e2' : days <= 7 ? '#fef3c7' : '#dcfce7', color: days <= 3 ? '#dc2626' : days <= 7 ? '#92400e' : '#15803d', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                          {days === 0 ? 'Today!' : days < 0 ? 'Overdue' : `${days}d`}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelected([f.id]); setSending(false); }}>Remind</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
