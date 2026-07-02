import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'MBA', 'MCA', 'AIDS', 'AIML', 'CSD'];

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [routes, setRoutes] = useState([]);
  const [filterRoute, setFilterRoute] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', studentId: '', rollNumber: '',
    department: '', year: '', section: '', address: '', boardingPoint: '',
    routeId: '', parentName: '', parentPhone: '', admissionDate: '', feeType: 'monthly',
  });

  const fetchStudents = async () => {
    try {
      const params = { page, limit: 15, search, routeId: filterRoute, registrationSource: filterSource };
      const r = await axios.get('/students', { params });
      setStudents(r.data.students); setTotal(r.data.total); setPages(r.data.pages);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { axios.get('/routes').then(r => setRoutes(r.data)); }, []);
  useEffect(() => { fetchStudents(); }, [page, search, filterRoute, filterSource]);

  const openCreate = () => {
    setEditStudent(null);
    setForm({ name: '', email: '', phone: '', password: '', studentId: '', rollNumber: '', department: '', year: '', section: '', address: '', boardingPoint: '', routeId: '', parentName: '', parentPhone: '', admissionDate: '', feeType: 'monthly' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ name: s.user?.name || '', email: s.user?.email || '', phone: s.user?.phone || '', studentId: s.studentId, rollNumber: s.rollNumber || '', department: s.department || '', year: s.year || '', section: s.section || '', address: s.address || '', boardingPoint: s.boardingPoint || '', routeId: s.routeId || '', parentName: s.parentName || '', parentPhone: s.parentPhone || '', admissionDate: s.admissionDate || '', feeType: s.feeType || 'monthly' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await axios.put(`/students/${editStudent.id}`, form);
        setMsg('Student updated successfully');
      } else {
        await axios.post('/students', form);
        setMsg('Student added successfully');
      }
      setShowModal(false); fetchStudents();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    await axios.delete(`/students/${id}`);
    fetchStudents();
  };

  const exportCSV = () => {
    const header = ['Student ID', 'Roll Number', 'Name', 'Email', 'Phone', 'Department', 'Year', 'Section', 'Route', 'Boarding Point', 'Fee Type', 'Parent Name', 'Parent Phone', 'Registration Source'];
    const rows = students.map(s => [
      s.studentId, s.rollNumber, s.user?.name, s.user?.email, s.user?.phone || '',
      s.department, s.year, s.section || '', s.route?.routeNumber || 'Unassigned',
      s.boardingPoint || '', s.feeType, s.parentName || '', s.parentPhone || '',
      s.registrationSource === 'self' ? 'Self Registered' : 'Admin Added'
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KEC_Bus_Students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>
      {msg && <div className={`alert ${msg.includes('Error') || msg.includes('already') ? 'alert-error' : 'alert-success'}`} onClick={() => setMsg('')}>{msg}</div>}
      <div className="search-bar">
        <div className="search-wrap" style={{ flex: 2 }}>
          <input className="search-input" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={filterRoute} onChange={e => { setFilterRoute(e.target.value); setPage(1); }}>
          <option value="">All Routes</option>
          {routes.map(r => <option key={r.id} value={r.id}>{r.routeNumber} — {r.routeName}</option>)}
        </select>
        <select className="filter-select" value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }}>
          <option value="">All Registrations</option>
          <option value="self">Self Registered</option>
          <option value="admin">Admin Added</option>
        </select>
        <button className="export-btn" onClick={exportCSV} title="Export student list as CSV">Export CSV</button>
        <button className="btn btn-primary" onClick={openCreate}>Add Student</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            KEC Bus Students
            <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 13 }}>({total} enrolled)</span>
          </h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student ID</th><th>Name</th><th>Department</th><th>Year</th><th>Route</th><th>Source</th><th>Fee Type</th><th>Contact</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state"><p>No students found</p></div></td></tr>
              ) : students.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.studentId}</strong></td>
                  <td>
                    <div>{s.user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.user?.email}</div>
                  </td>
                  <td>{s.department}</td>
                  <td>Year {s.year}</td>
                  <td>{s.route ? <span>{s.route.routeNumber}</span> : <span className="text-muted">Unassigned</span>}</td>
                  <td>
                    <span className={`badge ${s.registrationSource === 'self' ? 'badge-self-reg' : 'badge-admin-reg'}`}>
                      {s.registrationSource === 'self' ? 'Self Registered' : 'Admin Added'}
                    </span>
                  </td>
                  <td><span className="badge badge-info" style={{ background: '#e0f2fe', color: '#0369a1' }}>{s.feeType}</span></td>
                  <td style={{ fontSize: 12 }}>{s.user?.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Deactivate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing {students.length} of {total}</span>
          <div className="page-btns">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Account Info</div>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={!!editStudent} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                {!editStudent && <div className="form-group"><label>Password</label><input type="password" placeholder="Default: Student@123" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
              </div>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 12px', textTransform: 'uppercase' }}>Academic Info</div>
              <div className="form-row">
                <div className="form-group"><label>Student ID *</label><input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required /></div>
                <div className="form-group"><label>Roll Number</label><input value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Department *</label><select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required><option value="">Select Dept</option>{DEPTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="form-group"><label>Year *</label><select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required><option value="">Select Year</option>{[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}</select></div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 12px', textTransform: 'uppercase' }}>Transport Info</div>
              <div className="form-row">
                <div className="form-group"><label>Assigned Route</label><select value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })}><option value="">Select Route</option>{routes.map(r => <option key={r.id} value={r.id}>{r.routeNumber} — {r.routeName}</option>)}</select></div>
                <div className="form-group"><label>Boarding Point</label><input value={form.boardingPoint} onChange={e => setForm({ ...form, boardingPoint: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Fee Type</label><select value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })}><option value="monthly">Monthly</option><option value="term">Term</option><option value="annual">Annual</option></select></div>
                <div className="form-group"><label>Parent Phone</label><input value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Parent Name</label><input value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} placeholder="Student's Parent / Guardian Name" /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editStudent ? 'Update Student Record' : 'Create Student Account'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
