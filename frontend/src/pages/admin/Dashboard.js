import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/fees/dashboard').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /><p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10 }}>Loading dashboard...</p></div>;
  if (!stats) return <div className="alert alert-error">Failed to load dashboard data. Please refresh.</div>;

  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const total = (stats.summary?.collected || 0) + (stats.summary?.pending || 0) + (stats.summary?.overdue || 0);
  const collectionRate = total > 0 ? Math.round((stats.summary.collected / total) * 100) : 0;

  const pieData = [
    { name: 'Collected', value: stats.summary?.collected || 0, color: '#16803c' },
    { name: 'Pending', value: stats.summary?.pending || 0, color: '#d97706' },
    { name: 'Overdue', value: stats.summary?.overdue || 0, color: '#dc2626' },
  ].filter(d => d.value > 0);

  const routeBarData = (stats.routeStats || []).map(r => ({
    name: r.route?.routeNumber || 'N/A',
    collected: parseFloat(r.dataValues?.totalCollected || 0),
    students: parseInt(r.dataValues?.count || 0),
  }));

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, cls: 'blue', sub: 'Active enrollments', action: () => navigate('/admin/students') },
    { label: 'Active Routes', value: stats.totalRoutes, cls: 'purple', sub: 'Bus routes running', action: () => navigate('/admin/routes') },
    { label: 'Fees Collected', value: fmt(stats.summary?.collected), cls: 'green', sub: `${stats.paidCount || 0} payments`, action: () => navigate('/admin/fees') },
    { label: 'Pending Fees', value: fmt(stats.summary?.pending), cls: 'yellow', sub: `${stats.pendingCount || 0} students`, action: () => navigate('/admin/upcoming') },
    { label: 'Overdue Fees', value: fmt(stats.summary?.overdue), cls: 'red', sub: 'Needs urgent attention', action: () => navigate('/admin/overdue') },
    { label: 'Collection Rate', value: `${collectionRate}%`, cls: '', sub: stats.currentMonth || 'This month' },
  ];

  return (
    <div>
      <div className="card" style={{
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 800 }}>Administration</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            Kongu Engineering College
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Bus Transportation Fee Management · {stats.currentMonth}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate('/admin/reports')}>
            View Reports
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/fees')}>
            Fee Records
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map(s => (
          <div
            key={s.label}
            className={`stat-card ${s.cls}`}
            onClick={s.action}
            style={{ cursor: s.action ? 'pointer' : 'default' }}
          >
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
            {s.label === 'Collection Rate' && (
              <div className="progress-bar" style={{ marginTop: 10 }}>
                <div
                  className={`progress-fill ${collectionRate >= 80 ? 'progress-green' : collectionRate >= 50 ? 'progress-yellow' : 'progress-red'}`}
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
          Quick Actions
        </div>
        <div className="quick-actions">
          {[
            { label: 'Manage Students', action: () => navigate('/admin/students') },
            { label: 'Generate Fees', action: () => navigate('/admin/fees') },
            { label: 'Overdue Fees', action: () => navigate('/admin/overdue') },
            { label: 'Reports', action: () => navigate('/admin/reports') },
          ].map(a => (
            <div key={a.label} className="quick-action" onClick={a.action}>
              <span>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {pieData.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Fee Collection Status</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                {stats.currentMonth}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: collectionRate >= 80 ? 'var(--success)' : collectionRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                {collectionRate}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall Collection Rate</div>
            </div>
          </div>
        )}

        {routeBarData.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Collection by Route</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={routeBarData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="collected" fill="#0f3d8c" radius={[6, 6, 0, 0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Route Summary Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Route-wise Summary — {stats.currentMonth}</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/fees')}>View All Fees</button>
        </div>
        {routeBarData.length === 0 ? (
          <div className="empty-state">
            <h3>No fee data yet</h3>
            <p>Generate fees for this month to see the summary</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Route No.</th>
                  <th>Students Paid</th>
                  <th>Amount Collected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {routeBarData.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {r.name}
                      </span>
                    </td>
                    <td>{r.students} student{r.students !== 1 ? 's' : ''}</td>
                    <td><strong style={{ color: 'var(--success)', fontSize: 15 }}>{fmt(r.collected)}</strong></td>
                    <td><span className="badge badge-paid">Collected</span></td>
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
