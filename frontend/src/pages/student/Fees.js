import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import PaymentModal from '../../components/student/PaymentModal';

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payFee, setPayFee] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadFees = useCallback(() => {
    axios.get('/fees/my').then(r => setFees(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFees(); }, [loadFees]);

  const filtered = filter === 'all' ? fees : fees.filter(f => f.status === filter);
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const paid = fees.filter(f => f.status === 'paid');
  const pending = fees.filter(f => f.status === 'pending' || f.status === 'overdue');
  const totalPaid = paid.reduce((s, f) => s + parseFloat(f.totalAmount), 0);
  const totalDue = pending.reduce((s, f) => s + parseFloat(f.totalAmount), 0);
  const canPay = (f) => f.status === 'pending' || f.status === 'overdue';

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      {pending.length > 0 && (
        <div className="pay-banner">
          <div>
            <h3>{pending.length} fee{pending.length > 1 ? 's' : ''} pending payment</h3>
            <p>Total outstanding: <strong>{fmt(totalDue)}</strong></p>
          </div>
          <button className="btn btn-primary" onClick={() => setPayFee(pending[0])}>
            Pay Now
          </button>
        </div>
      )}

      <div className="stats-grid stats-grid-3">
        <div className="stat-card green">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">{fmt(totalPaid)}</div>
          <div className="stat-sub">{paid.length} payment{paid.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{fmt(totalDue)}</div>
          <div className="stat-sub">{pending.length} pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Receipts</div>
          <div className="stat-value">{paid.filter(f => f.receiptNumber).length}</div>
          <div className="stat-sub">Available for download</div>
        </div>
      </div>

      <div className="filter-tabs">
        {['all', 'pending', 'paid', 'overdue'].map(s => (
          <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="filter-count">{s === 'all' ? fees.length : fees.filter(f => f.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Fee Records</h3></div>
        {filtered.length === 0 ? (
          <div className="empty-state"><h3>No records found</h3><p>No {filter !== 'all' ? filter : ''} fee records to display.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Type</th>
                  <th>Route</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.feePeriod || f.feeMonth}</strong></td>
                    <td><span className="badge capitalize">{f.feeType}</span></td>
                    <td className="text-muted">{f.route?.routeNumber}</td>
                    <td><strong>{fmt(f.totalAmount)}</strong></td>
                    <td className={canPay(f) && new Date(f.dueDate) < new Date() ? 'text-danger' : 'text-muted'}>{f.dueDate}</td>
                    <td><span className={`badge badge-${f.status}`}>{f.status}</span></td>
                    <td>
                      {canPay(f) ? (
                        <button className="btn btn-primary btn-sm" onClick={() => setPayFee(f)}>Pay</button>
                      ) : f.status === 'paid' && f.receiptNumber ? (
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedFee(f)}>Receipt</button>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payFee && (
        <PaymentModal
          fee={payFee}
          onClose={() => setPayFee(null)}
          onSuccess={() => { setPayFee(null); loadFees(); }}
        />
      )}

      {selectedFee && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedFee(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">🧾 Payment Receipt</h3>
              <button className="modal-close" onClick={() => setSelectedFee(null)}>×</button>
            </div>
            <div className="receipt">
              <div className="receipt-header">
                <div style={{
                  width: 48, height: 48, borderRadius: 12, margin: '0 auto 10px',
                  background: 'linear-gradient(135deg, #0f3d8c, #16803c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 14
                }}>KEC</div>
                <div className="receipt-org">Kongu Engineering College</div>
                <div className="receipt-college">Erode — 638 052, Tamil Nadu</div>
                <div className="receipt-type">Bus Transportation Fee Receipt</div>
              </div>
              <div className="receipt-row"><span>Receipt No:</span><strong>{selectedFee.receiptNumber}</strong></div>
              <div className="receipt-row"><span>Student Name:</span><span>{user?.name}</span></div>
              <div className="receipt-row"><span>Route:</span><span>{selectedFee.route?.routeNumber} — {selectedFee.route?.routeName}</span></div>
              <div className="receipt-row"><span>Fee Period:</span><span>{selectedFee.feeMonth}</span></div>
              <div className="receipt-row"><span>Amount:</span><span>{fmt(selectedFee.amount)}</span></div>
              {selectedFee.lateFee > 0 && <div className="receipt-row"><span>Late Fee:</span><span className="text-danger">+ {fmt(selectedFee.lateFee)}</span></div>}
              {selectedFee.discount > 0 && <div className="receipt-row"><span>Discount:</span><span className="text-success">− {fmt(selectedFee.discount)}</span></div>}
              <div className="receipt-total"><span>Total Paid:</span><span className="text-success">{fmt(selectedFee.totalAmount)}</span></div>
              <div className="receipt-row"><span>Payment Mode:</span><span className="capitalize">{selectedFee.paymentMode}</span></div>
              {selectedFee.transactionId && <div className="receipt-row"><span>Transaction ID:</span><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{selectedFee.transactionId}</span></div>}
              <div className="receipt-row"><span>Paid On:</span><span>{selectedFee.paidDate}</span></div>
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
                Thank you for your payment!<br />
                KEC Bus Fees Portal · transport@kec.ac.in
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }} onClick={() => window.print()}>
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
