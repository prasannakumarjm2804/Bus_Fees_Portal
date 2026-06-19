import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const DashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const StudentsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const RouteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/>
  </svg>
);
const FeesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const NotifIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const PassIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);
const SupportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ReportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const ConcessionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const adminNav = [
  { section: 'Overview', items: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <DashIcon /> },
    { to: '/admin/reports', label: 'Reports', icon: <ReportIcon /> },
  ]},
  { section: 'Management', items: [
    { to: '/admin/students', label: 'Students', icon: <StudentsIcon /> },
    { to: '/admin/routes', label: 'Bus Routes', icon: <RouteIcon /> },
    { to: '/admin/fees', label: 'Fee Records', icon: <FeesIcon /> },
    { to: '/admin/concessions', label: 'Concessions', icon: <ConcessionIcon /> },
  ]},
  { section: 'Scheduling', items: [
    { to: '/admin/schedules', label: 'Schedules', icon: <CalIcon /> },
    { to: '/admin/upcoming', label: 'Upcoming Dues', icon: <CalIcon /> },
    { to: '/admin/overdue', label: 'Overdue', icon: <WarnIcon /> },
  ]},
  { section: 'Support', items: [
    { to: '/admin/support', label: 'Support Tickets', icon: <SupportIcon /> },
  ]},
];

const studentNav = [
  { section: 'Portal', items: [
    { to: '/student/dashboard', label: 'Dashboard', icon: <DashIcon /> },
    { to: '/student/fees', label: 'Fees & Payments', icon: <FeesIcon /> },
    { to: '/student/bus-pass', label: 'Bus Pass', icon: <PassIcon /> },
    { to: '/student/schedule', label: 'Schedule', icon: <CalIcon /> },
    { to: '/student/notifications', label: 'Notifications', icon: <NotifIcon />, badge: true },
  ]},
  { section: 'Services', items: [
    { to: '/student/concessions', label: 'Concessions', icon: <ConcessionIcon /> },
    { to: '/student/support', label: 'Support', icon: <SupportIcon /> },
    { to: '/student/profile', label: 'Profile', icon: <ProfileIcon /> },
  ]},
];

const pageTitles = {
  '/admin/dashboard': { title: 'Dashboard', sub: 'Collection overview and statistics' },
  '/admin/students': { title: 'Students', sub: 'Manage student records and registrations' },
  '/admin/routes': { title: 'Bus Routes', sub: 'Routes and fare structure' },
  '/admin/fees': { title: 'Fee Records', sub: 'Generate, collect and track payments' },
  '/admin/schedules': { title: 'Schedules', sub: 'Due dates and late fee rules' },
  '/admin/upcoming': { title: 'Upcoming Dues', sub: 'Fees due within 30 days' },
  '/admin/overdue': { title: 'Overdue Fees', sub: 'Past-due payments' },
  '/admin/reports': { title: 'Reports & Analytics', sub: 'Collection trends and exports' },
  '/admin/support': { title: 'Support Tickets', sub: 'Student queries and grievances' },
  '/admin/concessions': { title: 'Concession Requests', sub: 'Review fee concession applications' },
  '/admin/profile': { title: 'Admin Profile', sub: 'Account settings' },
  '/student/dashboard': { title: 'Dashboard', sub: 'Your fee account overview' },
  '/student/fees': { title: 'Fees & Payments', sub: 'Pay fees and download receipts' },
  '/student/bus-pass': { title: 'Digital Bus Pass', sub: 'Your valid transportation pass' },
  '/student/schedule': { title: 'Schedule', sub: 'Due dates and payment policy' },
  '/student/concessions': { title: 'Fee Concessions', sub: 'Apply for eligible discounts' },
  '/student/support': { title: 'Help & Support', sub: 'Submit queries to transportation office' },
  '/student/profile': { title: 'Profile', sub: 'Account and route details' },
  '/student/notifications': { title: 'Notifications', sub: 'Fee alerts and reminders' },
};

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    axios.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.isRead).length;
  const page = pageTitles[location.pathname] || { title: 'KEC Bus Fees Portal', sub: '' };
  const navGroups = isAdmin ? adminNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  const markAllRead = async () => {
    await axios.put('/notifications/read-all');
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand-mark">KEC</div>
          <div>
            <div className="brand-name">KEC Bus Fees Portal</div>
            <div className="brand-sub">{isAdmin ? 'Administration' : 'Student Portal'}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.section} className="nav-group">
              <div className="nav-section-label">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && unread > 0 && (
                    <span className="nav-badge">{unread}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div
            className="user-card"
            onClick={() => navigate(isAdmin ? '/admin/profile' : '/student/profile')}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(isAdmin ? '/admin/profile' : '/student/profile')}
          >
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <h2>{page.title}</h2>
              <p>{page.sub}</p>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-user">{user?.name}</span>
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="notif-btn" onClick={() => setShowNotif(!showNotif)} title="Notifications" aria-label="Notifications">
                <NotifIcon />
                {unread > 0 && <span className="notif-dot" />}
              </button>
              {showNotif && (
                <div className="notif-panel">
                  <div className="notif-header">
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      Notifications {unread > 0 && <span className="badge badge-overdue" style={{ marginLeft: 6 }}>{unread}</span>}
                    </span>
                    {unread > 0 && <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications</div>
                    ) : notifications.slice(0, 8).map(n => (
                      <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          axios.put(`/notifications/${n.id}/read`);
                          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                        }}>
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="notif-footer">
                    {!isAdmin && (
                      <button className="btn btn-outline btn-sm" onClick={() => { setShowNotif(false); navigate('/student/notifications'); }}>
                        View all
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm" onClick={() => setShowNotif(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>
            <div className="topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
