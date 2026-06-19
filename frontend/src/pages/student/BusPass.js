import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BusPass() {
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/students/bus-pass')
      .then(r => setPass(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => window.print();

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  const isActive = pass?.active;

  return (
    <div className="bus-pass-page">
      {!isActive && (
        <div className="alert alert-warning">
          <strong>Pass inactive:</strong> {pass?.reason || 'Unable to generate pass'}
          {(pass?.reason?.includes('Pay') || pass?.reason?.includes('overdue')) && (
            <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/student/fees')}>
              Pay Fees
            </button>
          )}
        </div>
      )}

      <div className={`bus-pass-card ${isActive ? 'active' : 'inactive'}`}>
        <div className="bus-pass-header">
          <div className="bus-pass-brand">
            <div className="bus-pass-logo">KEC</div>
            <div>
              <div className="bus-pass-title">Digital Bus Pass</div>
              <div className="bus-pass-sub">Kongu Engineering College</div>
            </div>
          </div>
          <div className={`bus-pass-status ${isActive ? 'valid' : 'invalid'}`}>
            {isActive ? 'VALID' : 'INACTIVE'}
          </div>
        </div>

        <div className="bus-pass-body">
          <div className="bus-pass-photo">
            <span>{pass?.student?.name?.charAt(0) || 'S'}</span>
          </div>
          <div className="bus-pass-details">
            <h3>{pass?.student?.name || '—'}</h3>
            <p className="bus-pass-id">{pass?.passId || pass?.student?.studentId || '—'}</p>
            <div className="bus-pass-grid">
              <div><label>Student ID</label><span>{pass?.student?.studentId || '—'}</span></div>
              <div><label>Department</label><span>{pass?.student?.department || '—'}</span></div>
              <div><label>Year / Section</label><span>{pass?.student?.year ? `Year ${pass.student.year}` : '—'}{pass?.student?.section ? ` · Sec ${pass.student.section}` : ''}</span></div>
              <div><label>Boarding Point</label><span>{pass?.student?.boardingPoint || '—'}</span></div>
              <div><label>Route</label><span>{pass?.route ? `${pass.route.routeNumber} — ${pass.route.routeName}` : '—'}</span></div>
              <div><label>Fee Type</label><span className="capitalize">{pass?.student?.feeType || '—'}</span></div>
            </div>
          </div>
        </div>

        <div className="bus-pass-footer">
          <div>
            <label>Valid From</label>
            <span>{pass?.validFrom || '—'}</span>
          </div>
          <div>
            <label>Valid Until</label>
            <span>{pass?.validUntil || '—'}</span>
          </div>
          <div>
            <label>Receipt</label>
            <span>{pass?.coveringFee?.receiptNumber || '—'}</span>
          </div>
        </div>

        {pass?.route?.startPoint && (
          <div className="bus-pass-route-bar">
            <span>{pass.route.startPoint}</span>
            <span className="route-arrow">→</span>
            <span>{pass.route.endPoint}</span>
          </div>
        )}
      </div>

      <div className="bus-pass-actions">
        <button className="btn btn-outline" onClick={handlePrint} disabled={!isActive}>Download / Print</button>
        <button className="btn btn-primary" onClick={() => navigate('/student/fees')}>View Fee History</button>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header"><h3 className="card-title">Pass Guidelines</h3></div>
        <ul className="guidelines-list">
          <li>Present this digital pass when boarding the college bus.</li>
          <li>Pass validity is linked to your latest paid fee period.</li>
          <li>Overdue fees will automatically suspend your pass.</li>
          <li>Report lost passes or route changes via Support.</li>
        </ul>
      </div>
    </div>
  );
}
