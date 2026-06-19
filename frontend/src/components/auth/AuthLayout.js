import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle, footerLink }) {
  return (
    <div className="login-page">
      <div className="login-panel-brand">
        <div className="brand-logo-lg">KEC</div>
        <h1>KEC Bus Fees Portal</h1>
        <p className="college-name">Kongu Engineering College</p>
        <p className="brand-location">Perundurai, Erode — Tamil Nadu</p>
        <div className="brand-divider" />
        <p className="brand-dept">Transportation Department</p>
        <div className="brand-footer">
          <span>© {new Date().getFullYear()} Kongu Engineering College</span>
        </div>
      </div>

      <div className="login-panel-form">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-brand">
              <div className="login-card-mark">KEC</div>
              <div>
                <div className="login-card-portal">KEC Bus Fees Portal</div>
                <div className="login-card-college">Kongu Engineering College</div>
              </div>
            </div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
          {footerLink && (
            <p className="auth-switch">
              {footerLink.text}{' '}
              <Link to={footerLink.to}>{footerLink.label}</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
