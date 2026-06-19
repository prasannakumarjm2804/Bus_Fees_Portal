import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PaymentModal from '../../components/student/PaymentModal';

export default function StudentSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payFee, setPayFee] = useState(null);

  const loadData = () => {
    Promise.all([axios.get('/schedules'), axios.get('/fees/my')])
      .then(([s, f]) => { setSchedules(s.data); setFees(f.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  const pending = fees.filter(f => f.status === 'pending' || f.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const daysUntil = date => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">Upcoming Payments</h3></div>
        {pending.length === 0 ? (
          <div className="empty-state"><h3>All payments complete</h3><p>No pending fees at this time.</p></div>
        ) : (
          <div className="schedule-timeline">
            {pending.map(f => {
              const days = daysUntil(f.dueDate);
              return (
                <div key={f.id} className="timeline-item">
                  <div className={`timeline-dot ${days < 0 ? 'overdue' : days <= 5 ? 'due-soon' : 'upcoming'}`} />
                  <div className="timeline-content">
                    <div className="timeline-row">
                      <div>
                        <div className="timeline-title">Bus Fee — {f.feePeriod || f.feeMonth}</div>
                        <div className="timeline-sub">Route {f.route?.routeNumber} · Due {f.dueDate}</div>
                      </div>
                      <div className="timeline-actions">
                        <strong>{fmt(f.totalAmount)}</strong>
                        <button className="btn btn-primary btn-sm" onClick={() => setPayFee(f)}>Pay</button>
                      </div>
                    </div>
                    <div className="timeline-meta">
                      <span className={`badge badge-${f.status}`}>{f.status}</span>
                      <span className={`timeline-status ${days < 0 ? 'overdue' : days <= 5 ? 'soon' : 'ok'}`}>
                        {days < 0 ? `Overdue by ${Math.abs(days)} days` : days === 0 ? 'Due today' : `${days} days left`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Payment Policy</h3></div>
        {schedules.length === 0 ? (
          <div className="empty-state"><h3>No policy configured</h3><p>Contact the transport office for schedule details.</p></div>
        ) : (
          <div className="policy-list">
            {schedules.filter(s => s.isActive).map(s => (
              <div key={s.id} className="policy-card">
                <div className="policy-header">
                  <strong>{s.title}</strong>
                  <span className="badge capitalize">{s.scheduleType}</span>
                </div>
                {s.description && <p className="policy-desc">{s.description}</p>}
                <div className="policy-grid">
                  <div><span>Due Day</span><strong>{s.dueDay}th of month</strong></div>
                  <div><span>Grace Period</span><strong>{s.gracePeriodDays} days</strong></div>
                  <div><span>Late Fee (Fixed)</span><strong>{s.lateFeeFixed > 0 ? fmt(s.lateFeeFixed) : 'None'}</strong></div>
                  <div><span>Late Fee (Daily)</span><strong>{s.lateFeePerDay > 0 ? `${fmt(s.lateFeePerDay)}/day` : 'None'}</strong></div>
                  <div><span>Reminder</span><strong>{s.reminderDaysBefore} days before</strong></div>
                  <div><span>Applies To</span><strong>{s.route ? s.route.routeNumber : 'All routes'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
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
