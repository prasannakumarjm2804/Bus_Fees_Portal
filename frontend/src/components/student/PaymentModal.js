import React, { useState } from 'react';
import axios from 'axios';

const METHODS = [
  { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major banks' },
];

export default function PaymentModal({ fee, onClose, onSuccess }) {
  const [method, setMethod] = useState('upi');
  const [step, setStep] = useState('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paidFee, setPaidFee] = useState(null);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const handlePay = async () => {
    setError('');
    setLoading(true);
    setStep('processing');
    try {
      await new Promise(r => setTimeout(r, 1800));
      const res = await axios.put(`/fees/${fee.id}/pay`, { paymentMethod: method });
      setPaidFee(res.data.fee);
      setStep('success');
      onSuccess?.(res.data.fee);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && step !== 'processing' && onClose()}>
      <div className="modal payment-modal">
        {step === 'success' && paidFee ? (
          <>
            <div className="payment-success">
              <div className="payment-success-icon">✓</div>
              <h3>Payment Successful</h3>
              <p>Your KEC bus fee has been paid and a digital receipt has been generated.</p>
            </div>
            <div className="payment-summary">
              <div className="payment-row"><span>Amount Paid</span><strong style={{ color: 'var(--success)', fontSize: 16 }}>{fmt(paidFee.totalAmount)}</strong></div>
              <div className="payment-row"><span>Fee Period</span><strong>{paidFee.feePeriod || paidFee.feeMonth}</strong></div>
              <div className="payment-row"><span>Receipt No.</span><strong className="text-primary">{paidFee.receiptNumber}</strong></div>
              {paidFee.transactionId && <div className="payment-row"><span>Transaction ID</span><strong style={{ fontFamily: 'monospace', fontSize: 12 }}>{paidFee.transactionId}</strong></div>}
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Kongu Engineering College — Bus Transportation Department
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Done</button>
          </>
        ) : step === 'processing' ? (
          <div className="payment-processing">
            <div className="spinner" />
            <h3>Processing Payment</h3>
            <p>Verifying your transaction with KEC Bus Fees Portal...</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3 className="modal-title">Pay Bus Fee - KEC</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="payment-amount-box">
              <span>Amount Due</span>
              <strong>{fmt(fee.totalAmount)}</strong>
              <small>{fee.feePeriod || fee.feeMonth} · {fee.feeType} · Route {fee.route?.routeNumber || '—'}</small>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-section-title">Select Payment Method</div>
            <div className="payment-methods">
              {METHODS.map(m => (
                <label key={m.id} className={`payment-method ${method === m.id ? 'selected' : ''}`}>
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <div>
                    <strong>{m.label}</strong>
                    <span>{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="payment-note">
              Payments are processed securely by KEC Bus Transportation. A digital receipt will be generated immediately upon confirmation. For payment issues, contact: <strong>transport@kec.ac.in</strong>
            </div>

            <div className="payment-actions">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
                Pay {fmt(fee.totalAmount)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
