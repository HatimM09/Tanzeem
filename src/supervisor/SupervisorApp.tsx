import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, History, AlertTriangle, LogOut, ChevronLeft, ChevronRight, Radio, CheckSquare } from 'lucide-react';
import SupervisorScanner from './SupervisorScanner';
import ScanHistory from './ScanHistory';
import RaiseComplaint from './RaiseComplaint';
import BarcodeLibrary from '../admin/BarcodeLibrary';
import SupervisorAudit from './SupervisorAudit';
import { ProcurementItem, ScanRecord, Complaint } from '../store/appStore';
import type { AuthUser } from '../components/PortalSelect';
import UserAvatar from '../components/UserAvatar';
import { MaintenanceEntry } from './MaintenanceLog';

type SupTab = 'scan' | 'audit' | 'history' | 'inventory' | 'complaints';

interface Props {
  items: ProcurementItem[];
  scanHistory: ScanRecord[];
  complaints: Complaint[];
  serverOnline: boolean | null;
  currentUser: any;
  onAddScan: (record: ScanRecord) => void;
  onRaiseComplaint: (c: Complaint) => void;
  onLogout: () => void;
}

const pageTransition = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as any },
};

export default function SupervisorApp({
  items, scanHistory, complaints, serverOnline, currentUser,
  onAddScan, onRaiseComplaint, onLogout,
}: Props) {
  const [tab, setTab] = useState<SupTab>('scan');
  const [collapsed, setCollapsed] = useState(false);
  const [scannedItem, setScannedItem] = useState<ProcurementItem | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceEntry[]>([]);

  const myComplaints = complaints.filter(c => c.raisedBy === 'Supervisor');
  const openCount = myComplaints.filter(c => c.status === 'open').length;

  const handleAddMaintenanceLog = (entry: MaintenanceEntry) => {
    setMaintenanceLogs(prev => [...prev, entry]);
  };

  const tabs = [
    { id: 'scan' as SupTab, label: 'Scanner', icon: ScanLine },
    { id: 'audit' as SupTab, label: 'Room Audit', icon: CheckSquare },
    { id: 'inventory' as SupTab, label: 'Inventory', icon: History }, // Using History icon for now or Tag
    { id: 'history' as SupTab, label: 'Scan History', icon: History, badge: scanHistory.length },
    { id: 'complaints' as SupTab, label: 'Complaints', icon: AlertTriangle, badge: openCount },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="layout-shell">
      {/* ─── Sidebar ─── */}
      <aside className={`layout-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <Radio size={18} color="#0c0e14" strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">Tanzeem</div>
            <div className="sidebar-brand-sub" style={{ color: '#34d399' }}>Supervisor</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(t => (
            <motion.button
              key={t.id}
              whileHover={{ x: 4, background: 'rgba(16,185,129,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab(t.id)}
              className={`sidebar-nav-item ${tab === t.id ? 'active' : ''}`}
              title={t.label}
              style={tab === t.id ? { boxShadow: 'inset 3px 0 0 #34d399', color: '#34d399' } : {}}
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
              <div style={{ fontSize: 10, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
                SUPERVISOR
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: serverOnline ? '#34d399' : '#f87171' }} className="pulse-dot" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <main className={`layout-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="layout-topbar">
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500, marginBottom: 2 }}>{greeting}, {currentUser.name?.split(' ')[0]} 👋</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {tab === 'scan' ? 'Barcode Scanner' : tab === 'audit' ? 'Room Audit Mode' : tab === 'history' ? 'Scan History' : tab === 'inventory' ? 'Inventory Library' : 'Complaints'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="chip chip-green" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

        <div className="layout-content">
          <AnimatePresence mode="wait">
            <motion.div key={tab} {...pageTransition}>
              {tab === 'scan' && (
                <SupervisorScanner
                  items={items}
                  onAddScan={onAddScan}
                  onItemScanned={setScannedItem}
                  onAddMaintenanceLog={handleAddMaintenanceLog}
                />
              )}
              {tab === 'audit' && <SupervisorAudit items={items} />}
              {tab === 'history' && <ScanHistory records={scanHistory} />}
              {tab === 'inventory' && <BarcodeLibrary items={items} maintenance={maintenanceLogs as any} />}
              {tab === 'complaints' && <RaiseComplaint items={items} complaints={myComplaints} onRaise={onRaiseComplaint} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
