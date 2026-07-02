import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminOverdue() {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [msg, setMsg] = useState({ text:'', type:'' });
  const [showCollect, setShowCollect] = useState(null);
  const [payForm, setPayForm] = useState({ paymentMode:'cash', transactionId:'', lateFee:0, discount:0, remarks:'' });

  useEffect(() => {
    axios.get('/schedules/overdue').then(r => setFees(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const notify = (text, type='success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text:'', type:'' }), 3000); };

  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === fees.length ? [] : fees.map(f => f.id));

  const sendReminders = async () => {
    if (!selected.length) return notify('Select students first', 'error');
    await axios.post('/schedules/reminders', { feeIds: selected });
    notify(`Reminders sent to ${selected.length} students`);
    setSelected([]);
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/fees/${showCollect.id}/collect`, payForm);
      notify('Payment collected!');
      setShowCollect(null);
      setFees(f => f.filter(x => x.id !== showCollect.id));
    } catch (err) { notify(err.response?.data?.message || 'Error', 'error'); }
  };

  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;
  const daysPast = date => Math.floor((new Date() - new Date(date)) / (1000*60*60*24));
  const totalOverdue = fees.reduce((s, f) => s + parseFloat(f.totalAmount), 0);

  if (loading) return <div className="loading-screen" style={{ height:300 }}><div className="spinner" /></div>;

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}

      <div className="stats-grid" style={{ marginBottom:20 }}>
        <div className="stat-card red"><div className="stat-label">Overdue Count</div><div className="stat-value">{fees.length}</div></div>
        <div className="stat-card red"><div className="stat-label">Total Overdue</div><div className="stat-value" style={{ fontSize:20 }}>{fmt(totalOverdue)}</div></div>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {selected.length > 0 && <>
          <button className="btn btn-warning" onClick={sendReminders}>Send Reminders ({selected.length})</button>
        </>}
        <button className="btn btn-outline btn-sm" onClick={toggleAll}>{selected.length === fees.length ? 'Deselect All' : 'Select All'}</button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Overdue Fees ({fees.length})</h3></div>
        {fees.length === 0 ? (
          <div className="empty-state"><h3>No overdue fees</h3><p>All payments are current</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th><input type="checkbox" onChange={toggleAll} checked={selected.length===fees.length&&fees.length>0} /></th><th>Student</th><th>Dept/Year</th><th>Route</th><th>Month</th><th>Amount</th><th>Due Date</th><th>Days Past Due</th><th>Action</th></tr></thead>
              <tbody>
                {fees.map(f => {
                  const days = daysPast(f.dueDate);
                  return (
                    <tr key={f.id}>
                      <td><input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggle(f.id)} /></td>
                      <td>
                        <div style={{ fontWeight:700 }}>{f.student?.user?.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{f.student?.studentId} • {f.student?.user?.phone}</div>
                      </td>
                      <td style={{ fontSize:12 }}>{f.student?.department} / Y{f.student?.year}</td>
                      <td><span style={{ background:'#dbeafe', color:'#1d4ed8', padding:'2px 8px', borderRadius:20, fontSize:12, fontWeight:700 }}>{f.route?.routeNumber}</span></td>
                      <td>{f.feeMonth}</td>
                      <td><strong style={{ color:'var(--danger)' }}>{fmt(f.totalAmount)}</strong></td>
                      <td style={{ fontSize:12 }}>{f.dueDate}</td>
                      <td>
                        <span style={{ background:'#fee2e2', color:'#dc2626', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:800 }}>
                          {days} days
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={() => { setShowCollect(f); setPayForm({ paymentMode:'cash', transactionId:'', lateFee: Math.min(days*10, 200), discount:0, remarks:`Overdue by ${days} days` }); }}>
                          Collect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCollect && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowCollect(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3 className="modal-title">Collect Overdue Payment</h3>
              <button className="modal-close" onClick={() => setShowCollect(null)}>X</button>
            </div>
            <div style={{ background:'#fff5f5', border:'1px solid #fecaca', borderRadius:10, padding:14, marginBottom:16, fontSize:13 }}>
              <div><strong>Student:</strong> {showCollect.student?.user?.name}</div>
              <div><strong>Month:</strong> {showCollect.feeMonth} | <strong>Base:</strong> ₹{showCollect.amount}</div>
              <div style={{ color:'var(--danger)', marginTop:4 }}><strong>Overdue by {daysPast(showCollect.dueDate)} days</strong></div>
            </div>
            <form onSubmit={handleCollect}>
              <div className="form-row">
                <div className="form-group"><label>Payment Mode</label><select value={payForm.paymentMode} onChange={e => setPayForm({...payForm, paymentMode:e.target.value})}><option value="cash">Cash</option><option value="online">Online</option><option value="cheque">Cheque</option><option value="dd">DD</option></select></div>
                <div className="form-group"><label>Late Fee (₹)</label><input type="number" min="0" value={payForm.lateFee} onChange={e => setPayForm({...payForm, lateFee:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Discount (₹)</label><input type="number" min="0" value={payForm.discount} onChange={e => setPayForm({...payForm, discount:e.target.value})} /></div>
                <div className="form-group"><label>Transaction ID</label><input value={payForm.transactionId} onChange={e => setPayForm({...payForm, transactionId:e.target.value})} /></div>
              </div>
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:12, textAlign:'center', fontWeight:800, fontSize:16, marginBottom:14 }}>
                Total: ₹{(Number(showCollect.amount)+Number(payForm.lateFee)-Number(payForm.discount)).toLocaleString()}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" className="btn btn-success" style={{ flex:1, justifyContent:'center' }}>Confirm Payment</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCollect(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
