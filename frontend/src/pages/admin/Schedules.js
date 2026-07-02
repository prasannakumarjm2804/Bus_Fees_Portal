import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [msg, setMsg] = useState({ text:'', type:'' });
  const [form, setForm] = useState({
    title:'', description:'', scheduleType:'monthly', startDate:'', endDate:'',
    dueDay:5, lateFeePerDay:0, lateFeeFixed:0, gracePeriodDays:5,
    reminderDaysBefore:3, routeId:'',
  });

  const fetch = () => {
    axios.get('/schedules').then(r => setSchedules(r.data));
    axios.get('/routes').then(r => setRoutes(r.data));
  };
  useEffect(() => { fetch(); }, []);

  const notify = (text, type='success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text:'', type:'' }), 3000); };

  const openCreate = () => {
    setEditItem(null);
    setForm({ title:'', description:'', scheduleType:'monthly', startDate:'', endDate:'', dueDay:5, lateFeePerDay:0, lateFeeFixed:0, gracePeriodDays:5, reminderDaysBefore:3, routeId:'' });
    setShowModal(true);
  };
  const openEdit = (s) => { setEditItem(s); setForm({ ...s, routeId: s.routeId || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`/schedules/${editItem.id}`, form);
        notify('Schedule updated!');
      } else {
        const r = await axios.post('/schedules', form);
        const fees = r.data.feesGenerated || 0;
        notify(fees > 0
          ? `Schedule created. ${fees} student fee(s) generated and notified.`
          : 'Schedule created. No new fees generated - ensure students have matching fee type and route.');
      }
      setShowModal(false); fetch();
    } catch (err) { notify(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleGenerateFees = async (id) => {
    try {
      const r = await axios.post(`/schedules/${id}/generate-fees`);
      notify(r.data.message + (r.data.created > 0 ? ' Students notified.' : ''));
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to generate fees', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this schedule?')) return;
    await axios.delete(`/schedules/${id}`);
    notify('Schedule deactivated');
    fetch();
  };

  const typeColors = { monthly:'#dbeafe:#1d4ed8', term:'#fce7f3:#9d174d', annual:'#dcfce7:#15803d', custom:'#ede9fe:#6d28d9' };
  const getTypeStyle = (t) => { const [bg,color] = (typeColors[t]||'#f1f5f9:#64748b').split(':'); return { background:bg, color }; };

  return (
    <div>
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>
      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div className="alert alert-info" style={{ flex:1, marginBottom:0, marginRight:16 }}>
          Creating a monthly, term, or annual schedule automatically generates pending fee records for matching students. Students must have the same fee type and an assigned route.
        </div>
        <button className="btn btn-primary" onClick={openCreate}>New Schedule</button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Payment Schedules ({schedules.length})</h3></div>
        {schedules.length === 0 ? (
          <div className="empty-state"><h3>No schedules yet</h3><p>Create payment schedules to manage fee due dates and late fees</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Type</th><th>Route</th><th>Due Day</th><th>Grace Period</th><th>Late Fee</th><th>Reminder</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight:700 }}>{s.title}</div>
                      {s.description && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{s.description}</div>}
                    </td>
                    <td><span className="badge" style={getTypeStyle(s.scheduleType)}>{s.scheduleType}</span></td>
                    <td style={{ fontSize:12 }}>{s.route ? `${s.route.routeNumber} - ${s.route.routeName}` : <span style={{ color:'var(--text-muted)' }}>All routes</span>}</td>
                    <td>
                      <span style={{ background:'#f0f9ff', color:'#0369a1', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                        Day {s.dueDay}
                      </span>
                    </td>
                    <td>{s.gracePeriodDays} days</td>
                    <td style={{ fontSize:12 }}>
                      {s.lateFeeFixed > 0 && <div>Fixed: <strong>₹{s.lateFeeFixed}</strong></div>}
                      {s.lateFeePerDay > 0 && <div>Per day: <strong>₹{s.lateFeePerDay}</strong></div>}
                      {s.lateFeeFixed == 0 && s.lateFeePerDay == 0 && <span style={{ color:'var(--text-muted)' }}>No late fee</span>}
                    </td>
                    <td>{s.reminderDaysBefore} days before</td>
                    <td><span className={`badge badge-${s.isActive ? 'active' : 'inactive'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {s.scheduleType !== 'custom' && s.isActive && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleGenerateFees(s.id)}>Generate Fees</button>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Schedule' : 'New Payment Schedule'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Schedule Title *</label><input value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Monthly Fee Schedule 2024" required /></div>
                <div className="form-group"><label>Schedule Type</label>
                  <select value={form.scheduleType} onChange={e => setForm({...form, scheduleType:e.target.value})}>
                    <option value="monthly">Monthly</option>
                    <option value="term">Term</option>
                    <option value="annual">Annual</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Optional description..." /></div>
              <div className="form-row">
                <div className="form-group"><label>Apply to Route</label>
                  <select value={form.routeId} onChange={e => setForm({...form, routeId:e.target.value})}>
                    <option value="">All Routes</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.routeNumber} - {r.routeName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Due Day of Month (1–28)</label>
                  <input type="number" min="1" max="28" value={form.dueDay} onChange={e => setForm({...form, dueDay:e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Date *</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate:e.target.value})} required /></div>
                <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate:e.target.value})} /></div>
              </div>
              <div className="form-section-title">Grace Period & Late Fees</div>
              <div className="form-row">
                <div className="form-group"><label>Grace Period (days)</label><input type="number" min="0" value={form.gracePeriodDays} onChange={e => setForm({...form, gracePeriodDays:e.target.value})} /></div>
                <div className="form-group"><label>Fixed Late Fee (₹)</label><input type="number" min="0" step="0.01" value={form.lateFeeFixed} onChange={e => setForm({...form, lateFeeFixed:e.target.value})} /></div>
                <div className="form-group"><label>Late Fee Per Day (₹)</label><input type="number" min="0" step="0.01" value={form.lateFeePerDay} onChange={e => setForm({...form, lateFeePerDay:e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Reminder Days Before Due</label>
                <input type="number" min="1" max="30" value={form.reminderDaysBefore} onChange={e => setForm({...form, reminderDaysBefore:e.target.value})} />
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Students will be notified this many days before the due date</div>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>{editItem ? 'Update Schedule' : 'Create Schedule'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
