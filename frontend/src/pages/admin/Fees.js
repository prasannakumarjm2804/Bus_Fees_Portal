import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const KEC_NAME = 'Kongu Engineering College';
const KEC_PORTAL = 'KEC Bus Fees Portal';

export default function AdminFees() {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [payForm, setPayForm] = useState({ paymentMode: 'cash', transactionId: '', lateFee: 0, discount: 0, remarks: '' });
  const [genForm, setGenForm] = useState({
    feeMonth: new Date().toISOString().slice(0, 7),
    dueDate: '',
    feeType: 'by_student',
    academicYear: new Date().getFullYear(),
  });
  const [genResult, setGenResult] = useState(null);

  const fetchFees = async () => {
    try {
      const r = await axios.get('/fees', { params: { page, limit: 15, status: filterStatus, feeMonth: filterMonth, search } });
      setFees(r.data.fees); setTotal(r.data.total); setPages(r.data.pages);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchFees(); }, [page, filterStatus, filterMonth, search]);

  const notify = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/fees/${selectedFee.id}/collect`, payForm);
      notify('Payment recorded successfully.');
      setShowPayModal(false); fetchFees();
    } catch (err) { notify(err.response?.data?.message || 'Error occurred', 'error'); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post('/fees/generate', genForm);
      setGenResult(r.data);
      notify(r.data.message);
      setShowGenModal(false); fetchFees();
    } catch (err) { notify(err.response?.data?.message || 'Error generating fees', 'error'); }
  };

  // CSV Export
  const exportCSV = () => {
    const header = ['Student Name', 'Student ID', 'Route', 'Period', 'Fee Type', 'Base Amount', 'Total Amount', 'Due Date', 'Status', 'Paid Date', 'Payment Mode', 'Transaction ID'];
    const rows = fees.map(f => [
      f.student?.user?.name || '',
      f.student?.studentId || '',
      f.route?.routeNumber || '',
      f.feePeriod || f.feeMonth || '',
      f.feeType || '',
      f.amount || 0,
      f.totalAmount || 0,
      f.dueDate || '',
      f.status || '',
      f.paidDate || '',
      f.paymentMode || '',
      f.transactionId || '',
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KEC_Bus_Fees_${filterMonth || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('CSV exported successfully.');
  };

  const statusColor = { paid: 'badge-paid', pending: 'badge-pending', overdue: 'badge-overdue', waived: 'badge-waived' };
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div>
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>←</span> Back
      </button>
      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.text}
        </div>
      )}
      {genResult && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          Generated: {genResult.count || 0} fee records. Students have been notified.
          <button className="btn btn-outline btn-sm" style={{ marginLeft: 12 }} onClick={() => setGenResult(null)}>Dismiss</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <div className="search-wrap" style={{ flex: 2 }}>
          <input
            className="search-input"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <input
          type="month"
          className="filter-select"
          value={filterMonth}
          onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
          style={{ width: 155 }}
        />
        <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="waived">Waived</option>
        </select>
        <button className="export-btn" onClick={exportCSV} title="Export as CSV">
          Export CSV
        </button>
        <button className="btn btn-primary" onClick={() => setShowGenModal(true)}>
          Generate Fees
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Fee Records
            <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 13 }}>({total})</span>
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filterMonth || 'All months'}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Route</th>
                <th>Period</th>
                <th>Type</th>
                <th>Base Amt</th>
                <th>Total</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <h3>No fee records found</h3>
                    <p>Try changing filters or generate fees for this month.</p>
                  </div>
                </td></tr>
              ) : fees.map(f => (
                <tr key={f.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{f.student?.user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.student?.studentId}</div>
                  </td>
                  <td>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                      {f.route?.routeNumber || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{f.feePeriod || f.feeMonth}</td>
                  <td><span className="badge capitalize" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>{f.feeType}</span></td>
                  <td style={{ fontSize: 13 }}>{fmt(f.amount)}</td>
                  <td><strong style={{ fontSize: 14 }}>{fmt(f.totalAmount)}</strong></td>
                  <td style={{ fontSize: 12, color: f.status === 'overdue' ? 'var(--danger)' : 'var(--text-muted)' }}>{f.dueDate}</td>
                  <td><span className={`badge ${statusColor[f.status] || ''}`}>{f.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(f.status === 'pending' || f.status === 'overdue') ? (
                        <button className="btn btn-success btn-sm" onClick={() => {
                          setSelectedFee(f);
                          setPayForm({ paymentMode: 'cash', transactionId: '', lateFee: f.lateFee || 0, discount: 0, remarks: '' });
                          setShowPayModal(true);
                        }}>Collect</button>
                      ) : f.status === 'paid' ? (
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectedFee(f); setShowReceiptModal(true); }}>Receipt</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing {fees.length} of {total} records</span>
          <div className="page-btns">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
          </div>
        </div>
      </div>

      {/* Generate Fees Modal */}
      {showGenModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGenModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">Generate Bus Fees</h3>
              <button className="modal-close" onClick={() => setShowGenModal(false)}>X</button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label>Fee Type</label>
                <select value={genForm.feeType} onChange={e => setGenForm({ ...genForm, feeType: e.target.value })}>
                  <option value="by_student">Per Student Profile (monthly/term/annual)</option>
                  <option value="monthly">Monthly — all monthly-plan students</option>
                  <option value="term">Term — all term-plan students</option>
                  <option value="annual">Annual — all annual-plan students</option>
                </select>
              </div>
              {genForm.feeType === 'monthly' && (
                <div className="form-group">
                  <label>Fee Month</label>
                  <input type="month" value={genForm.feeMonth} onChange={e => setGenForm({ ...genForm, feeMonth: e.target.value })} required />
                </div>
              )}
              {(genForm.feeType === 'annual' || genForm.feeType === 'term') && (
                <div className="form-group">
                  <label>Academic Year</label>
                  <input type="number" value={genForm.academicYear} onChange={e => setGenForm({ ...genForm, academicYear: e.target.value })} required min="2020" max="2035" />
                </div>
              )}
              <div className="form-group">
                <label>Due Date *</label>
                <input type="date" value={genForm.dueDate} onChange={e => setGenForm({ ...genForm, dueDate: e.target.value })} required />
              </div>
              <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 12 }}>
                Fee records will be created for all students with an assigned bus route and matching fee type. Students will receive a notification automatically.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Generate Fees</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowGenModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPayModal && selectedFee && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPayModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 className="modal-title">Collect Payment</h3>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>X</button>
            </div>
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Payment Details</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Student:</span>
                <strong>{selectedFee.student?.user?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Period:</span>
                <span>{selectedFee.feeMonth}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base Amount:</span>
                <strong style={{ color: 'var(--primary)', fontSize: 16 }}>{fmt(selectedFee.amount)}</strong>
              </div>
            </div>
            <form onSubmit={handleCollect}>
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Mode *</label>
                  <select value={payForm.paymentMode} onChange={e => setPayForm({ ...payForm, paymentMode: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="online">Online Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="dd">Demand Draft</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Late Fee (₹)</label>
                  <input type="number" min="0" value={payForm.lateFee} onChange={e => setPayForm({ ...payForm, lateFee: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount (₹)</label>
                  <input type="number" min="0" value={payForm.discount} onChange={e => setPayForm({ ...payForm, discount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Transaction / Receipt ID</label>
                  <input value={payForm.transactionId} onChange={e => setPayForm({ ...payForm, transactionId: e.target.value })} placeholder="Optional" />
                </div>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input value={payForm.remarks} onChange={e => setPayForm({ ...payForm, remarks: e.target.value })} placeholder="Optional note" />
              </div>
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 800 }}>Total Payable</div>
                <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--success)' }}>
                  {fmt(Number(selectedFee.amount) + Number(payForm.lateFee) - Number(payForm.discount))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>Confirm & Record Payment</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowPayModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal — KEC Branded */}
      {showReceiptModal && selectedFee && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowReceiptModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">Payment Receipt</h3>
              <button className="modal-close" onClick={() => setShowReceiptModal(false)}>X</button>
            </div>
            <div className="receipt">
              <div className="receipt-header">
                <div style={{
                  width: 48, height: 48, borderRadius: 12, margin: '0 auto 10px',
                  background: 'linear-gradient(135deg, #0f3d8c, #16803c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 14
                }}>KEC</div>
                <div className="receipt-org">{KEC_NAME}</div>
                <div className="receipt-college">Erode — 638 052, Tamil Nadu</div>
                <div className="receipt-type">Bus Transportation Fee Receipt</div>
              </div>
              <div className="receipt-row"><span>Receipt No:</span><strong>{selectedFee.receiptNumber || '—'}</strong></div>
              <div className="receipt-row"><span>Student Name:</span><span>{selectedFee.student?.user?.name}</span></div>
              <div className="receipt-row"><span>Student ID:</span><span>{selectedFee.student?.studentId}</span></div>
              <div className="receipt-row"><span>Route:</span><span>{selectedFee.route?.routeNumber || '—'} – {selectedFee.route?.routeName || ''}</span></div>
              <div className="receipt-row"><span>Fee Period:</span><span>{selectedFee.feePeriod || selectedFee.feeMonth}</span></div>
              <div className="receipt-row"><span>Base Amount:</span><span>{fmt(selectedFee.amount)}</span></div>
              {selectedFee.lateFee > 0 && <div className="receipt-row"><span>Late Fee:</span><span style={{ color: 'var(--danger)' }}>+ {fmt(selectedFee.lateFee)}</span></div>}
              {selectedFee.discount > 0 && <div className="receipt-row"><span>Discount:</span><span style={{ color: 'var(--success)' }}>− {fmt(selectedFee.discount)}</span></div>}
              <div className="receipt-total"><span>Total Paid:</span><span style={{ color: 'var(--success)' }}>{fmt(selectedFee.totalAmount)}</span></div>
              <div className="receipt-row"><span>Payment Mode:</span><span style={{ textTransform: 'capitalize' }}>{selectedFee.paymentMode || '—'}</span></div>
              {selectedFee.transactionId && <div className="receipt-row"><span>Transaction ID:</span><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{selectedFee.transactionId}</span></div>}
              <div className="receipt-row"><span>Paid On:</span><span>{selectedFee.paidDate || '—'}</span></div>
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
                Thank you for your timely payment!<br />
                For queries: transport@kec.ac.in | {KEC_PORTAL}
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }} onClick={() => window.print()}>
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
