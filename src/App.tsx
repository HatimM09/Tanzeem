import React, { useState, useEffect, useCallback } from 'react';
import PortalSelect, { AuthUser } from './components/PortalSelect';
import AdminApp from './admin/AdminApp';
import SupervisorApp from './supervisor/SupervisorApp';
import InventoryApp from './inventory/InventoryApp';
import {
  initialItems, initialScanHistory, initialComplaints, initialMaintenance, initialAuditLogs,
} from './store/appStore';
import { useSync } from './hooks/useSync';
import { api } from './lib/api';
import { MaintenanceRecord } from './store/appStore';

export type { AuthUser };

export default function App() {
  const [activeUser, setActiveUser]     = useState<(AuthUser & { portal: 'admin' | 'supervisor' | 'inventory' }) | null>(() => {
    const saved = localStorage.getItem('tanzeem_session');
    return saved ? JSON.parse(saved) : null;
  });

  const {
    items, complaints, scanHistory, auditLogs, serverOnline,
    addItem, deleteItem, addScan, raiseComplaint, resolveComplaint,
  } = useSync(initialItems, initialComplaints, initialScanHistory, activeUser?.name || 'Admin', !!activeUser);

  // Maintenance is now part of items in Supabase
  const maintenance: MaintenanceRecord[] = []; 

  // Persist session
  useEffect(() => {
    if (activeUser) {
      localStorage.setItem('tanzeem_session', JSON.stringify(activeUser));
    } else {
      localStorage.removeItem('tanzeem_session');
    }
  }, [activeUser]);

  const handleSelect = useCallback((portal: 'admin' | 'supervisor' | 'inventory', user: AuthUser) => {
    setActiveUser({ ...user, portal });
  }, []);

  const handleLogout = useCallback(() => setActiveUser(null), []);

  const handleBulkAdd = useCallback(async (newItems: any[]) => {
    try {
      await api.items.bulkCreate(newItems, activeUser?.name || 'Admin');
      // Force refresh data
      window.location.reload();
    } catch (error: any) {
      alert(`Bulk import failed: ${error.message}`);
    }
  }, [activeUser]);

  if (!activeUser) {
    return (
      <PortalSelect onSelect={handleSelect} serverOnline={serverOnline} />
    );
  }

  return (
    <div className="full-screen-view">
      {activeUser.portal === 'admin' ? (
        <AdminApp
          items={items} complaints={complaints}
          maintenance={maintenance} auditLogs={auditLogs}
          serverOnline={serverOnline} currentUser={activeUser}
          onAddItem={addItem} onDeleteItem={deleteItem}
          onBulkAdd={handleBulkAdd}
          onResolveComplaint={resolveComplaint} onLogout={handleLogout}
        />
      ) : activeUser.portal === 'supervisor' ? (
        <SupervisorApp
          items={items} scanHistory={scanHistory} complaints={complaints}
          serverOnline={serverOnline} currentUser={activeUser}
          onAddScan={addScan} onRaiseComplaint={raiseComplaint}
          onLogout={handleLogout}
        />
      ) : (
        <InventoryApp
          items={items} maintenance={maintenance}
          serverOnline={serverOnline} currentUser={activeUser}
          onAddItem={addItem}
          onBulkAdd={handleBulkAdd}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
