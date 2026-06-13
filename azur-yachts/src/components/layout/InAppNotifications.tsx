'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function InAppNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Rafraîchissement périodique (facultatif mais utile)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      // Remove the read notification from the list entirely
      setNotifications(notifications.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="notif-btn" ref={menuRef} style={{ position: 'relative', cursor: 'pointer' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ position: 'relative' }}>
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '0.1rem 0.3rem', fontSize: '0.65rem', fontWeight: 'bold' }}>
            {unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '120%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          overflow: 'hidden',
          color: 'var(--text, #111827)'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border, #e5e7eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text, #111827)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.75rem', cursor: 'pointer' }}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                Aucune notification.
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} onClick={() => { markAsRead(notif.id); if(notif.link) window.location.href = notif.link; }} style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border)',
                  background: notif.isRead ? 'transparent' : 'rgba(212, 175, 55, 0.05)',
                  cursor: notif.link ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text, #111827)', marginBottom: '0.25rem' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-mid, #4b5563)', lineHeight: 1.4 }}>
                        {notif.body}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-light, #9ca3af)', marginTop: '0.4rem' }}>
                        {new Date(notif.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    {!notif.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }}></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
