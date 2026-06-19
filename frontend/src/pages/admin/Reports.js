import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#15803d', '#b45309', '#b91c1c', '#7c3aed'];

export default function AdminReports() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('');

  const load = (p = '') => {
    setLoading(true);
    const q = p ? `?period=${p}` : '';
    axios.get(`/fees/reports${q}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const handleExport = () => {
    if (!data?.recentPayments?.length) return;
    const headers = ['Student', 'Route', 'Period', 'Amount', 'Paid Date', 'Receipt', 'Mode'];
    const rows = data.recentPayments.map(f => [
      f.student?.user?.name || '',
      f.route?.routeNumber || '',
      f.feePeriod || f.feeMonth || '',
      f.totalAmount,
      f.paidDate || '',
      f.receiptNumber || '',
      f.paymentMode || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kec-bus-fees-report-${data.period || 'all'}.csv`;
    a.click();
  };

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;
  if (!data) return <div className="alert alert-error">Failed to load reports.</div>;

  const statusPie = [
    { name: 'Collected', value: data.summary?.byStatus?.paid || 0 },
    { name: 'Pending', value: data.summary?.byStatus?.pending || 0 },
    { name: 'Overdue', value: data.summary?.byStatus?.overdue || 0 },
  ].filter(d => d.value > 0);

  const trendData = (data.monthlyTrend || []).map(m => ({
    month: m.feeMonth,
    collected: parseFloat(m.collected || 0),
  }));

  const routeData = (data.routeCollection || []).map(r => ({
    name: r.route?.routeNumber || 'N/A',
    collected: parseFloat(r.dataValues?.collected || r.get?.('collected') || 0),
  }));

  return (
    <div>
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Report Filters</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="month" value={period} onChange={e => setPeriod(e.target.value)} style={{ width: 160 }} />
            <button className="btn btn-primary btn-sm" onClick={() => load(period)}>Apply</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setPeriod(''); load(''); }}>All Time</button>
            <button className="btn btn-outline btn-sm" onClick={handleExport}>Export CSV</button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-label">Total Collected</div>
          <div className="stat-value">{fmt(data.summary?.totalCollected)}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{fmt(data.summary?.totalOutstanding)}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{data.summary?.totalRecords || 0}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Online Payments</div>
          <div className="stat-value">{fmt(data.summary?.byPaymentMode?.online)}</div>
        </div>
      </div>

      <div className="content-grid">
        {trendData.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">Monthly Collection Trend</h3></div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="collected" fill="#0c3d8c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statusPie.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">Fee Status Breakdown</h3></div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {routeData.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h3 className="card-title">Collection by Route</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={routeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="collected" fill="#15803d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title">Recent Payments</h3></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Route</th><th>Period</th><th>Amount</th><th>Paid</th><th>Receipt</th><th>Mode</th></tr>
            </thead>
            <tbody>
              {(data.recentPayments || []).map(f => (
                <tr key={f.id}>
                  <td><strong>{f.student?.user?.name || '—'}</strong></td>
                  <td>{f.route?.routeNumber || '—'}</td>
                  <td>{f.feePeriod || f.feeMonth}</td>
                  <td>{fmt(f.totalAmount)}</td>
                  <td className="text-muted">{f.paidDate || '—'}</td>
                  <td className="text-muted">{f.receiptNumber || '—'}</td>
                  <td className="capitalize">{f.paymentMode || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
