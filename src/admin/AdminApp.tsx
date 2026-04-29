import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, PlusCircle, Tag, AlertCircle, LogOut,
  ScrollText, Database, Image, ChevronLeft, ChevronRight, Activity,
  MapPin, QrCode, MessageSquare,
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AddProcurement from './AddProcurement';
import BarcodeLibrary from './BarcodeLibrary';
import AdminComplaints from './AdminComplaints';
import CSVArchive from './CSVArchive';
import ProofGallery from './ProofGallery';
import InteractiveMap from './InteractiveMap';
import QRDesigner from './QRDesigner';
import { ProcurementItem, Complaint, MaintenanceRecord, AuditLog } from '../store/appStore';
import type { AuthUser } from '../components/PortalSelect';
import UserAvatar from '../components/UserAvatar';

type AdminTab = 'dashboard' | 'add' | 'library' | 'complaints' | 'archive' | 'proof' | 'logs' | 'map' | 'qr' | 'whatsapp';

interface AdminAppProps {
  items: ProcurementItem[];
  complaints: Complaint[];
  maintenance: MaintenanceRecord[];
  auditLogs: AuditLog[];
  serverOnline: boolean | null;
  currentUser: any;
  onAddItem: (item: ProcurementItem) => void;
  onDeleteItem: (id: string) => void;
  onBulkAdd: (items: Omit<ProcurementItem, 'id' | 'createdAt' | 'createdBy'>[]) => void;
  onResolveComplaint: (id: string, note: string, photo: string | null) => void;
  onLogout: () => void;
}

const pageTransition = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as any },
};

export default function AdminApp({
  items, complaints, maintenance, auditLogs, serverOnline,
  currentUser, onAddItem, onDeleteItem, onBulkAdd, onResolveComplaint, onLogout,
}: AdminAppProps) {
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [activeLogCat, setActiveLogCat] = useState<string>('ALL');
  const openComplaints = complaints.filter(c => c.status === 'open').length;

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'map' as AdminTab, label: 'Live Map', icon: MapPin },
    { id: 'library' as AdminTab, label: 'Inventory', icon: Tag },
    { id: 'add' as AdminTab, label: 'Add Item', icon: PlusCircle },
    { id: 'qr' as AdminTab, label: 'QR Labels', icon: QrCode },
    { id: 'complaints' as AdminTab, label: 'Complaints', icon: AlertCircle, badge: openComplaints },
    { id: 'proof' as AdminTab, label: 'Proof', icon: Image },
    { id: 'whatsapp' as AdminTab, label: 'Bot Sync', icon: MessageSquare },
    { id: 'archive' as AdminTab, label: 'Archive', icon: Database },
    { id: 'logs' as AdminTab, label: 'Logs', icon: ScrollText },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="layout-shell">
      {/* ─── Sidebar ─── */}
      <aside className={`layout-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Activity size={18} color="#0c0e14" strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">Tanzeem</div>
            <div className="sidebar-brand-sub">Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(t => (
            <motion.button
              key={t.id}
              whileHover={{ x: 4, background: 'var(--primary-light)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab(t.id)}
              className={`sidebar-nav-item ${tab === t.id ? 'active' : ''}`}
              title={t.label}
            >
              <span className="nav-icon"><t.icon size={18} /></span>
              <span>{t.label}</span>
              {t.badge ? <span className="sidebar-nav-badge">{t.badge}</span> : null}
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: 12 }}>
            {!collapsed && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account</span>}
            <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
          <div className="sidebar-user">
            <UserAvatar user={currentUser} size={collapsed ? 32 : 36} />
            <div className="sidebar-user-info">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                ADMIN
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: serverOnline ? '#34d399' : '#f87171' }} className="pulse-dot" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <main className={`layout-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="layout-topbar">
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500, marginBottom: 2 }}>{greeting}, {currentUser.name?.split(' ')[0]} 👋</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {tab === 'dashboard' ? 'Dashboard' : tab === 'add' ? 'New Procurement' : tab === 'library' ? 'Inventory' : tab === 'complaints' ? 'Complaints' : tab === 'proof' ? 'Proof Gallery' : tab === 'archive' ? 'Archive' : tab === 'map' ? 'Interactive Campus Map' : tab === 'qr' ? 'Label Designer' : tab === 'whatsapp' ? 'WhatsApp Integration' : 'Audit Logs'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="chip chip-gold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: serverOnline ? '#34d399' : '#f87171' }} />
              {serverOnline ? 'Connected' : 'System Sync'}
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, color: 'var(--danger)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout} 
              className="btn-ghost" 
              style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}
            >
              <LogOut size={14} /> Logout
            </motion.button>
          </div>
        </header>

        {/* Content */}
        <div className="layout-content">
          <AnimatePresence mode="wait">
            <motion.div key={tab} {...pageTransition}>
              {tab === 'dashboard' && <AdminDashboard items={items} complaints={complaints} onNavigate={setTab} />}
              {tab === 'add' && <AddProcurement onAdd={onAddItem} onDone={() => setTab('library')} />}
              {tab === 'library' && <BarcodeLibrary items={items} maintenance={maintenance} onDeleteItem={onDeleteItem} onBulkAdd={onBulkAdd} />}
              {tab === 'complaints' && <AdminComplaints complaints={complaints} onResolve={onResolveComplaint} />}
              {tab === 'map' && <InteractiveMap items={items} />}
              {tab === 'qr' && <QRDesigner />}
              {tab === 'whatsapp' && (
                <div className="fade-in">
                  <div className="bright-panel" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                      <MessageSquare size={40} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>WhatsApp Status Bot</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: 15, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
                      Enable the WhatsApp bot to receive real-time notifications for critical complaints and allow supervisors to check stock levels via text commands.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button className="bright-button" style={{ background: '#25D366', color: 'white' }}>
                        CONNECT WHATSAPP
                      </button>
                      <button className="btn-ghost">VIEW DOCUMENTATION</button>
                    </div>
                  </div>
                </div>
              )}
              {tab === 'archive' && <CSVArchive />}
              {tab === 'proof' && <ProofGallery complaints={complaints} />}
              {tab === 'logs' && (
                <div className="fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Audit Activity Logs</h2>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['ALL', 'ITEM', 'COMPLAINT', 'SCAN', 'MAINTENANCE'].map(cat => {
                        const count = cat === 'ALL' ? auditLogs.length : auditLogs.filter(l => l.entityType === cat).length;
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveLogCat(cat)}
                            className={activeLogCat === cat ? 'chip chip-gold' : 'chip'}
                            style={{
                              cursor: 'pointer',
                              border: activeLogCat === cat ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border-strong)',
                              background: activeLogCat === cat ? 'rgba(212,175,55,0.1)' : 'var(--bg-surface)',
                              color: activeLogCat === cat ? 'var(--primary-vivid)' : 'var(--text-dim)',
                              padding: '6px 12px',
                              fontSize: 11,
                              fontWeight: 700,
                              borderRadius: 20,
                            }}
                          >
                            {cat} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bright-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    {auditLogs.length === 0 && <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>No activity logs found.</div>}
                    {auditLogs
                      .filter(log => activeLogCat === 'ALL' || log.entityType === activeLogCat)
                      .map((log, i, arr) => (
                      <div key={log.id} className="feed-item">
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: log.entityType === 'ITEM' ? 'rgba(99,102,241,0.1)' :
                                      log.entityType === 'COMPLAINT' ? 'rgba(239,68,68,0.1)' :
                                      log.entityType === 'SCAN' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <ScrollText size={16} color={
                            log.entityType === 'ITEM' ? '#818cf8' :
                            log.entityType === 'COMPLAINT' ? '#f87171' :
                            log.entityType === 'SCAN' ? '#34d399' : '#fbbf24'
                          } />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                              <span className="chip" style={{
                                fontSize: 9, marginRight: 8, padding: '2px 8px',
                                background: 'var(--bg-elevated)', color: 'var(--text-dim)',
                                borderRadius: 6,
                              }}>{log.entityType}</span>
                              {log.action}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>{log.performedAt}</span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{log.details}</div>

                          {log.diff && (
                            <div style={{ marginTop: 8, background: 'var(--bg-surface)', borderRadius: 10, padding: 10, border: '1px solid var(--border)' }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase' }}>Field Changes</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {(() => {
                                  try {
                                    return Object.entries(JSON.parse(log.diff || '{}')).map(([field, values]: [string, any]) => (
                                      <div key={field} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{field}:</span>
                                        <span style={{ color: 'var(--text-dim)', textDecoration: 'line-through' }}>{String(values.from)}</span>
                                        <span style={{ color: 'var(--text-dim)' }}>→</span>
                                        <span style={{ fontWeight: 700, color: '#34d399' }}>{String(values.to)}</span>
                                      </div>
                                    ));
                                  } catch (e) {
                                    return <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Error parsing change details</div>;
                                  }
                                })()}
                              </div>
                            </div>
                          )}

                          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginTop: 4 }}>User: {log.performedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
