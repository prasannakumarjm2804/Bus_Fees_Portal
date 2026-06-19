import React from 'react';

export default function Placeholder({ title, description, icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 40
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>{icon || '🚧'}</div>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6 }}>
        {description}
      </p>
      <div style={{ marginTop: 30, padding: '12px 20px', background: '#dbeafe', color: '#1e40af', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
        Feature in Development
      </div>
    </div>
  );
}
