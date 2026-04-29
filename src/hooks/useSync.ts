import { useState, useEffect, useCallback } from 'react';
import { api, resolveImageUrl } from '../lib/api';
import { ProcurementItem, Complaint, ScanRecord, AuditLog } from '../store/appStore';

// Mapping functions (Supabase snake_case to Frontend camelCase)
function mapItem(r: any): ProcurementItem {
  return {
    id: r.id, 
    name: r.name, 
    assignedTo: r.assigned_to || r.assignedTo,
    location: r.location, 
    category: r.category,
    photoUrl: resolveImageUrl(r.photo_url || r.photoUrl),
    barcode: r.barcode, 
    createdAt: r.created_at || r.createdAt, 
    createdBy: r.created_by || r.createdBy,
    stock: r.stock || 0,
    reorderLevel: r.reorder_level || r.reorderLevel || 0,
    condition: r.condition || 'Good',
  };
}

function mapComplaint(r: any): Complaint {
  return {
    id: r.id, 
    itemId: r.item_id || r.itemId, 
    itemName: r.item_name || r.itemName,
    itemBarcode: r.item_barcode || r.itemBarcode, 
    location: r.location,
    description: r.description, 
    priority: r.priority || 'MEDIUM', 
    raisedBy: r.raised_by || r.raisedBy,
    raisedAt: r.raised_at || r.raisedAt, 
    status: r.status,
    resolvedAt: r.resolved_at || r.resolvedAt, 
    resolvedBy: r.resolved_by || r.resolvedBy,
    resolvedPhotoUrl: resolveImageUrl(r.resolved_photo_url || r.resolvedPhotoUrl) ?? undefined,
    resolvedNote: r.resolved_note || r.resolvedNote,
  };
}

function mapScan(r: any): ScanRecord {
  const item = r.items || r.item;
  return {
    id: r.id, 
    barcode: r.barcode,
    scannedAt: r.scanned_at || r.scannedAt, 
    scannedBy: r.scanned_by || r.scannedBy,
    item: item ? mapItem(item) : null,
  };
}

export function useSync(initialItems: ProcurementItem[], initialComplaints: Complaint[], initialScans: ScanRecord[], activeUserName: string, isLoggedIn: boolean) {
  const [items, setItems]               = useState<ProcurementItem[]>(initialItems);
  const [complaints, setComplaints]     = useState<Complaint[]>(initialComplaints);
  const [scanHistory, setScanHistory]   = useState<ScanRecord[]>(initialScans);
  const [auditLogs, setAuditLogs]       = useState<AuditLog[]>([]);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Health check & Initial fetch
  useEffect(() => {
    const checkHealth = () => {
      api.health()
        .then(() => {
          setServerOnline(true);
          if (isLoggedIn) {
            Promise.all([
              api.items.list({ limit: 200 }),
              api.complaints.list(),
              api.scans.list({ limit: 200 }),
              api.audit.list(100),
            ]).then(([itemsData, complaintsData, scansData, auditData]) => {
              setItems((itemsData as any[]).map(mapItem));
              setComplaints((complaintsData as any[]).map(mapComplaint));
              setScanHistory((scansData as any[]).map(mapScan));
              setAuditLogs(auditData as any[]);
            }).catch(console.error);
          }
        })
        .catch(() => setServerOnline(false));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const logAudit = useCallback((action: string, entityType: any, entityId: string, details: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      action, entityType, entityId, details,
      performedBy: activeUserName || 'Admin',
      performedAt: new Date().toLocaleString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  }, [activeUserName]);

  const addItem = useCallback(async (item: ProcurementItem) => {
    if (serverOnline) {
      try {
        const created = await api.items.create({
          name: item.name, assignedTo: item.assignedTo,
          location: item.location, category: item.category,
          createdBy: item.createdBy, photoDataUrl: item.photoUrl,
        });
        const mapped = mapItem(created);
        setItems(prev => [...prev, mapped]); 
        logAudit('CREATE', 'ITEM', mapped.id, `Created item ${mapped.name}`);
        return;
      } catch (e) { console.warn('API error', e); }
    }
    setItems(prev => [...prev, item]);
    logAudit('CREATE', 'ITEM', item.id, `Created item ${item.name} (Offline)`);
  }, [serverOnline, logAudit]);

  const deleteItem = useCallback(async (id: string) => {
    if (serverOnline) {
      try {
        await api.items.delete(id);
        setItems(prev => prev.filter(i => i.id !== id));
        logAudit('DELETE', 'ITEM', id, `Deleted item`);
        return;
      } catch (e) { console.warn('API error', e); }
    }
    setItems(prev => prev.filter(i => i.id !== id));
    logAudit('DELETE', 'ITEM', id, `Deleted item (Offline)`);
  }, [serverOnline, logAudit]);

  const addScan = useCallback(async (record: ScanRecord) => {
    if (serverOnline) {
      try {
        const saved = await api.scans.record(record.barcode, record.scannedBy);
        setScanHistory(prev => [...prev, mapScan(saved)]); 
        logAudit('SCAN', 'SCAN', record.id, `Scanned barcode ${record.barcode}`);
        return;
      } catch (e) { console.warn('API error', e); }
    }
    setScanHistory(prev => [...prev, record]);
    logAudit('SCAN', 'SCAN', record.id, `Scanned barcode ${record.barcode} (Offline)`);
  }, [serverOnline, logAudit]);

  const raiseComplaint = useCallback(async (complaint: Complaint) => {
    if (serverOnline) {
      try {
        const saved = await api.complaints.raise({
          itemId: complaint.itemId, description: complaint.description, raisedBy: complaint.raisedBy,
        });
        const mapped = mapComplaint(saved);
        setComplaints(prev => [...prev, mapped]); 
        logAudit('CREATE', 'COMPLAINT', mapped.id, `Raised complaint for ${mapped.itemName}`);
        return;
      } catch (e) { console.warn('API error', e); }
    }
    setComplaints(prev => [...prev, complaint]);
    logAudit('CREATE', 'COMPLAINT', complaint.id, `Raised complaint for ${complaint.itemName} (Offline)`);
  }, [serverOnline, logAudit]);

  const resolveComplaint = useCallback(async (id: string, note: string, photo: string | null) => {
    const resolvedBy = activeUserName || 'Admin';
    if (serverOnline) {
      try {
        const saved = await api.complaints.resolve(id, { resolvedNote: note, resolvedBy, photoDataUrl: photo });
        setComplaints(prev => prev.map(c => c.id === id ? mapComplaint(saved) : c)); 
        logAudit('RESOLVE', 'COMPLAINT', id, `Resolved complaint`);
        return;
      } catch (e) { console.warn('API error', e); }
    }
    setComplaints(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: 'resolved', resolvedAt: new Date().toLocaleString(), resolvedBy, resolvedNote: note, resolvedPhotoUrl: photo || undefined }
        : c
    ));
    logAudit('RESOLVE', 'COMPLAINT', id, `Resolved complaint (Offline)`);
  }, [serverOnline, activeUserName, logAudit]);

  return {
    items, setItems,
    complaints, setComplaints,
    scanHistory, setScanHistory,
    auditLogs,
    serverOnline,
    addItem, deleteItem,
    addScan, raiseComplaint, resolveComplaint,
    logAudit,
  };
}
