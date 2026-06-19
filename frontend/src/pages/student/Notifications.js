import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TYPE_LABEL = {
  general: 'General',
  schedule: 'Schedule',
  payment_due: 'Payment Due',
  payment_received: 'Payment',
  overdue: 'Overdue',
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/notifications').then(r => setNotifications(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await axios.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await axios.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.isRead);

  const unread = notifications.filter(n => !n.isRead).length;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  if (loading) return <div className="loading-screen" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="notif-page-header">
        <div>
          <h3>Notifications</h3>
          <p>{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all read</button>}
      </div>

      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {['all', 'unread', 'read'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="filter-count">
              {f === 'all' ? notifications.length : f === 'unread' ? unread : notifications.length - unread}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No notifications</h3><p>Alerts and payment updates will appear here.</p></div></div>
      ) : (
        <div className="notif-feed">
          {filtered.map(n => (
            <div key={n.id} className={`notif-feed-item ${!n.isRead ? 'unread' : ''}`} onClick={() => !n.isRead && markRead(n.id)}>
              <div className="notif-feed-body">
                <div className="notif-feed-top">
                  <div>
                    <span className="notif-type">{TYPE_LABEL[n.type] || 'Notice'}</span>
                    <strong>{n.title}</strong>
                  </div>
                  <span className="notif-feed-time">{timeAgo(n.createdAt)}</span>
                </div>
                <p>{n.message}</p>
                {!n.isRead && <span className="unread-dot">Unread</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
