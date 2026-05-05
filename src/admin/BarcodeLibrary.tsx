import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Tag, MapPin, User, Calendar,
  Trash2, FileDown, AlertTriangle, FileUp, X, Check, RefreshCw, Edit2
} from 'lucide-react';
import { api } from '../lib/api';
import { ProcurementItem, ProcurementCategory, MaintenanceRecord } from '../store/appStore';
import { renderPDF417, downloadBarcode, exportCSV, renderQRCode } from '../utils/barcode';

function QRCodeDisplay({ barcode }: { barcode: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    renderQRCode(barcode).then(setImgSrc);
  }, [barcode]);

  if (!imgSrc) return <div style={{ height: 100 }} />;
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'center' }}>
      <img src={imgSrc} alt="QR Code" style={{ width: 120, height: 120 }} />
    </div>
  );
}

const categoryColors: Record<string, string> = {
  'IT Equipment': '#818cf8', 'Accessories': '#10b981', 'Furniture': '#fbbf24', 'Lab Equipment': '#22d3ee',
  'Library': '#34d399', 'Sports': '#fb923c', 'Stationery': '#c084fc',
  'Electrical': '#facc15', 'Maintenance': '#f87171', 'Other': '#94a3b8',
};

const allCats: (ProcurementCategory | 'All')[] = [
  'All', 'IT Equipment', 'Accessories', 'Furniture', 'Lab Equipment', 'Library',
  'Sports', 'Stationery', 'Electrical', 'Maintenance', 'Other',
];

function PDF417Display({ barcode }: { barcode: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(null);
    setError(false);
    renderPDF417(barcode)
      .then(r => setImgSrc(r.dataUrl))
      .catch(() => setError(true));
  }, [barcode]);

  if (error) {
    return (
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'DM Mono, monospace' }}>{barcode}</span>
      </div>
    );
  }
  if (!imgSrc) {
    return (
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 8, overflow: 'hidden' }}>
      <img
        src={imgSrc}
        alt={barcode}
        style={{ width: '100%', display: 'block', borderRadius: 6, imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}

interface Props {
  items: ProcurementItem[];
  maintenance: MaintenanceRecord[];
  onDeleteItem?: (id: string) => void;
  onBulkAdd?: (items: Omit<ProcurementItem, 'id' | 'createdAt' | 'createdBy'>[]) => void;
}

export default function BarcodeLibrary({ items, maintenance, onDeleteItem, onBulkAdd }: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cat, setCat] = useState<ProcurementCategory | 'All'>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkMove, setShowBulkMove] = useState(false);
  const [bulkMoveLocation, setBulkMoveLocation] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ProcurementItem | null>(null);
  const [editTarget, setEditTarget] = useState<ProcurementItem | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [downloading, setDownloading] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset limit on filter change
  useEffect(() => { setLimit(20); }, [debouncedSearch, cat]);
  const [csvExporting, setCsvExporting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const lines = importText.trim().split('\n');
      if (lines.length < 2) throw new Error('Need at least header and one data row');
      
      const newItems = lines.slice(1).map(line => {
        const [name, assignedTo, location, category] = line.split(',').map(s => s.trim());
        if (!name || !category) throw new Error('Missing required fields');
        return { 
          name, assignedTo, location, 
          category: category as ProcurementCategory, 
          photoUrl: null, 
          barcode: `UNIV-${category.substring(0,2).toUpperCase()}-${Math.floor(Math.random()*10000)}`,
          stock: 1,
          reorderLevel: 0,
          unitPrice: 0,
          condition: 'Good' as const
        };
      });

      onBulkAdd?.(newItems);
      setShowImport(false);
      setImportText('');
      setImportError(null);
    } catch (err: any) {
      setImportError(err.message || 'Invalid CSV format');
    }
  };

  const filtered = items.filter(i => {
    const q = debouncedSearch.toLowerCase();
    const matchQ =
      i.name.toLowerCase().includes(q) ||
      i.barcode.toLowerCase().includes(q) ||
      i.assignedTo.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q);
    const matchC = cat === 'All' || i.category === cat;
    return matchQ && matchC;
  });

  const displayItems = filtered.slice(0, limit);

  const handleDownload = async (item: ProcurementItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(item.id);
    try {
      await downloadBarcode(
        item.barcode,
        item.name,
        item.assignedTo,
        item.category,
        item.location,
      );
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = (item: ProcurementItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (deleteTarget && onDeleteItem) {
      onDeleteItem(deleteTarget.id);
      if (expanded === deleteTarget.id) setExpanded(null);
    }
    setDeleteTarget(null);
  };

  const openEdit = (item: ProcurementItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(item);
    setEditData({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      await api.items.update(editTarget.id, editData);
      window.location.reload();
    } catch (err: any) {
      alert(`Failed to update item: ${err.message}`);
    }
  };

  const handleExportCSV = async () => {
    setCsvExporting(true);
    try { exportCSV(filtered); } finally {
      setTimeout(() => setCsvExporting(false), 1000);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkMoveSubmit = async () => {
    if (!bulkMoveLocation.trim()) return alert('Enter a location');
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.items.update(id, { location: bulkMoveLocation })));
      window.location.reload();
    } catch (e: any) {
      alert('Bulk move failed: ' + e.message);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      <AnimatePresence>
        {deleteTarget && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bright-panel" style={{ padding: 24, width: '100%', maxWidth: 360 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={28} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px', textAlign: 'center' }}>Delete Item?</h3>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', textAlign: 'center', margin: '0 0 16px', fontWeight: 600 }}>This action cannot be undone. You are removing <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>"{deleteTarget.name}"</span>.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setDeleteTarget(null)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={confirmDelete} style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: 'var(--radius-md)', padding: '12px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete Item</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bright-panel" style={{ padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Edit Item</h3>
                <button onClick={() => setEditTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Name</label>
                  <input className="input-field" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Assigned To</label>
                    <input className="input-field" value={editData.assignedTo || ''} onChange={e => setEditData({...editData, assignedTo: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Location</label>
                    <input className="input-field" value={editData.location || ''} onChange={e => setEditData({...editData, location: e.target.value})} />
                  </div>
                </div>
                {editTarget.category === 'IT Equipment' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Processor</label>
                      <input className="input-field" value={editData.processor || ''} onChange={e => setEditData({...editData, processor: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>RAM</label>
                      <input className="input-field" value={editData.ram || ''} onChange={e => setEditData({...editData, ram: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setEditTarget(null)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleSaveEdit} className="bright-button" style={{ flex: 1, padding: '12px' }}>Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showImport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bright-panel" style={{ padding: 24, width: '100%', maxWidth: 500 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Bulk Import Items</h3>
                <button onClick={() => setShowImport(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, fontWeight: 600 }}>Paste CSV data below. Format: <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>Name, AssignedTo, Location, Category</code></p>
              <textarea className="input-field" style={{ height: 200, fontFamily: 'DM Mono, monospace', fontSize: 12, resize: 'none', marginBottom: 16 }} placeholder="Item Name, John Doe, Lab 101, IT Equipment" value={importText} onChange={e => setImportText(e.target.value)} />
              {importError && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 16, fontWeight: 700 }}>⚠️ {importError}</p>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowImport(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleImport} className="bright-button" style={{ flex: 1, padding: '12px' }}>Import {importText.split('\n').length - 1} Items</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Move Modal */}
      <AnimatePresence>
        {showBulkMove && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bright-panel" style={{ padding: 24, width: '100%', maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Bulk Move {selectedIds.size} Items</h3>
                <button onClick={() => setShowBulkMove(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>New Location</label>
                <input className="input-field" placeholder="e.g. IT Store Room" value={bulkMoveLocation} onChange={e => setBulkMoveLocation(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowBulkMove(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleBulkMoveSubmit} className="bright-button" style={{ flex: 1, padding: '12px' }}>Move Items</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={{ padding: '0 0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Inventory Library</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '4px 0 0', fontWeight: 600 }}>
              Search and manage registered inventory barcodes
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.location.reload()} className="btn-ghost" style={{ padding: '10px 16px', fontSize: 12 }}>
              <RefreshCw size={14} /> Clear Cache
            </button>
            <button onClick={handleExportCSV} className="bright-button" style={{ padding: '10px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, background: csvExporting ? '#10b981' : 'var(--primary)' }}>
              <FileDown size={14} /> {csvExporting ? 'Exported!' : 'Export CSV'}
            </button>
          </div>

        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input-field" style={{ paddingLeft: 44 }} placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {allCats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: cat === c ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border-strong)', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: cat === c ? 'rgba(212,175,55,0.08)' : 'var(--bg-surface)', color: cat === c ? 'var(--primary-vivid)' : 'var(--text-dim)', transition: 'all 0.2s' }}>{c}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bright-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏷️</div>
          <div style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 700 }}>No items match your criteria</div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" checked={selectedIds.size === filtered.length} onChange={toggleSelectAll} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{selectedIds.size} items selected</span>
          </div>
          <button onClick={() => setShowBulkMove(true)} className="bright-button" style={{ padding: '8px 16px', fontSize: 12 }}>Bulk Move Location</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {displayItems.map((item, i) => {
          const color = categoryColors[item.category] || 'var(--primary)';
          const isOpen = expanded === item.id;
          const isDownloading = downloading === item.id;

          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bright-panel" style={{ overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isOpen ? null : item.id)} style={{ padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={selectedIds.has(item.id)} onChange={e => toggleSelect(item.id, e as any)} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Tag size={20} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{item.barcode}</div>
                    {maintenance.some(m => m.itemId === item.id) && (
                      <span style={{ fontSize: 9, fontWeight: 800, background: '#10b98120', color: '#10b981', padding: '2px 6px', borderRadius: 4 }}>MAINTAINED</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={e => handleDownload(item, e)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {isDownloading ? <div style={{ width: 14, height: 14, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Download size={16} color="var(--primary)" />}
                  </button>
                  <button onClick={e => openEdit(item, e)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Edit2 size={16} color="var(--text-main)" />
                  </button>
                  {onDeleteItem && (
                    <button onClick={e => handleDelete(item, e)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #fee2e2', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ borderTop: '1px solid var(--border)', padding: 20, background: 'var(--bg-surface)' }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 800, textTransform: 'uppercase' }}>PDF417 Barcode</div>
                          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 12, border: '1px solid var(--border)' }}>
                            <PDF417Display barcode={item.barcode} />
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 800, textTransform: 'uppercase' }}>QR Code</div>
                          <QRCodeDisplay barcode={item.barcode} />
                        </div>
                      </div>
                    </div>

                    {item.category === 'IT Equipment' && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 10, fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Tag size={12} /> Technical Specifications
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                          {[
                            { label: 'Office', value: item.office },
                            { label: 'Idara', value: item.idara },
                            { label: 'Seatings', value: item.seatings },
                            { label: 'Processor', value: item.processor },
                            { label: 'RAM', value: item.ram },
                            { label: 'HDD', value: item.hdd },
                            { label: 'SSD', value: item.ssd },
                          ].filter(f => f.value).map(f => (
                            <div key={f.label} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>{f.label}</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.photoUrl && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, fontWeight: 800 }}>Product Photo</div>
                        <img src={item.photoUrl} alt={item.name} style={{ width: '100%', borderRadius: 14, maxHeight: 200, objectFit: 'cover', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }} />
                      </div>
                    )}
                    <button onClick={e => handleDownload(item, e)} className="bright-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14 }}>
                      <Download size={18} /> Download High-Res Barcode
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filtered.length > limit && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => setLimit(prev => prev + 20)}
            className="btn-ghost"
            style={{ padding: '12px 24px', fontSize: 14, fontWeight: 700 }}
          >
            Load More Items ({filtered.length - limit} remaining)
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
