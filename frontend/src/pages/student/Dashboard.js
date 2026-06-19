import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../../components/student/PaymentModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payFee, setPayFee] = useState(null);

  const loadData = useCallback(() => {
    Promise.all([axios.get('/students/profile'), axios.get('/fees/my')])
      .then(([p, f]) => { setProfile(p.data); setFees(f.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  const paid = fees.filter(f => f.status === 'paid');
  const pending = fees.filter(f => f.status === 'pending' || f.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const overdue = fees.filter(f => f.status === 'overdue');
  const totalPaid = paid.reduce((s, f) => s + parseFloat(f.totalAmount), 0);
  const totalPending = pending.reduce((s, f) => s + parseFloat(f.totalAmount), 0);
  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;
  const nextDue = pending[0];
  const daysUntil = date => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div className="page-hero">
        <div>
          <p className="page-hero-label">KEC Bus Fees Portal · Student</p>
          <h2>Welcome back, {user?.name?.split(' ')[0]}</h2>
          {profile && (
            <p className="page-hero-meta">
              {profile.studentId} · {profile.department} · Year {profile.year}
              {profile.section && ` · Sec ${profile.section}`}
              {profile.route && ` · Route ${profile.route.routeNumber}`}
            </p>
          )}
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="alert alert-error">
          You have {overdue.length} overdue fee{overdue.length > 1 ? 's' : ''} totaling {fmt(overdue.reduce((s, f) => s + parseFloat(f.totalAmount), 0))}. Please pay immediately to avoid further penalties.
        </div>
      )}

      {nextDue && (
        <div className={`alert ${daysUntil(nextDue.dueDate) <= 3 ? 'alert-warning' : 'alert-info'}`}>
          Next payment of {fmt(nextDue.totalAmount)} for {nextDue.feePeriod || nextDue.feeMonth} is due on {nextDue.dueDate}
          {daysUntil(nextDue.dueDate) > 0 ? ` (${daysUntil(nextDue.dueDate)} days remaining)` : daysUntil(nextDue.dueDate) === 0 ? ' (due today)' : ' (overdue)'}.
        </div>
      )}

      {pending.length > 0 && (
        <div className="pay-banner">
          <div>
            <h3>Outstanding Bus Fee Balance</h3>
            <p>{fmt(totalPending)} due across {pending.length} pending fee{pending.length > 1 ? 's' : ''} — pay before the due date to avoid late charges</p>
          </div>
          <button className="btn btn-white" onClick={() => setPayFee(nextDue)}>Pay Now</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">{fmt(totalPaid)}</div>
          <div className="stat-sub">{paid.length} payment{paid.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{fmt(totalPending)}</div>
          <div className="stat-sub">{pending.length} pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Fee</div>
          <div className="stat-value">{profile?.route ? fmt(profile.route.monthlyFee) : '—'}</div>
          <div className="stat-sub">Current route rate</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Payment Rate</div>
          <div className="stat-value">{fees.length ? Math.round((paid.length / fees.length) * 100) : 0}%</div>
          <div className="stat-sub">{paid.length} of {fees.length} paid</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="quick-actions">
          <div className="quick-action" onClick={() => navigate('/student/bus-pass')}>
            <span>Bus Pass</span>
          </div>
          <div className="quick-action" onClick={() => navigate('/student/fees')}>
            <span>Pay Fees</span>
          </div>
          <div className="quick-action" onClick={() => navigate('/student/concessions')}>
            <span>Concessions</span>
          </div>
          <div className="quick-action" onClick={() => navigate('/student/support')}>
            <span>Get Support</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {profile?.route && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">Route Details</h3></div>
            <div className="info-list">
              {[
                ['Route', `${profile.route.routeNumber} — ${profile.route.routeName}`],
                ['Boarding Point', profile.boardingPoint || '—'],
                ['Monthly Fee', fmt(profile.route.monthlyFee)],
                ['Fee Type', profile.feeType],
                ['Parent Contact', profile.parentPhone || '—'],
              ].map(([k, v]) => (
                <div className="info-row" key={k}><span>{k}</span><strong>{v}</strong></div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/fees')}>View All</button>
          </div>
          {fees.length === 0 ? (
            <div className="empty-state"><h3>No fee records</h3><p>Your fee history will appear here.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Period</th><th>Amount</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {fees.slice(0, 5).map(f => (
                    <tr key={f.id}>
                      <td><strong>{f.feePeriod || f.feeMonth}</strong></td>
                      <td>{fmt(f.totalAmount)}</td>
                      <td className="text-muted">{f.dueDate}</td>
                      <td><span className={`badge badge-${f.status}`}>{f.status}</span></td>
                      <td>
                        {(f.status === 'pending' || f.status === 'overdue') ? (
                          <button className="btn btn-primary btn-sm" onClick={() => setPayFee(f)}>Pay</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {payFee && (
        <PaymentModal
          fee={payFee}
          onClose={() => setPayFee(null)}
          onSuccess={() => { setPayFee(null); loadData(); }}
        />
      )}
    </div>
  );
}
