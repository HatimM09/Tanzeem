import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ChevronDown, MoreHorizontal, Plus, 
  Laptop, FileUp, X, CheckCircle, Package, 
  MapPin, Tag, User, Camera, Cpu, Download
} from 'lucide-react';
import { ProcurementItem, ProcurementCategory } from '../store/appStore';

declare global {
  interface Window {
    XLSX: any;
  }
}

interface Props {
  items: ProcurementItem[];
  onAdd: (item: ProcurementItem) => void;
  onBulkAdd: (items: Omit<ProcurementItem, 'id' | 'createdAt' | 'createdBy'>[]) => void;
}

const CATEGORIES: ProcurementCategory[] = [
  'IT Equipment', 'Furniture', 'Lab Equipment', 'Library', 'Sports',
  'Stationery', 'Electrical', 'Maintenance', 'Other'
];

export default function ItemCategories({ items, onAdd, onBulkAdd }: Props) {
  const [selectedCat, setSelectedCat] = useState<ProcurementCategory>('IT Equipment');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Form State for Add Item
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [location, setLocation] = useState('');
  const [office, setOffice] = useState('');
  const [idara, setIdara] = useState('');
  const [seatings, setSeatings] = useState('');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('');
  const [hdd, setHdd] = useState('');
  const [ssd, setSsd] = useState('');

  const headers = selectedCat === 'IT Equipment' ? [
    { label: 'Office', key: 'office' },
    { label: 'Idara', key: 'idara' },
    { label: 'Seatings', key: 'seatings' },
    { label: 'Asset', key: 'name' },
    { label: 'Processor', key: 'processor' },
    { label: 'Ram', key: 'ram' },
    { label: 'Hdd', key: 'hdd' },
    { label: 'Ssd', key: 'ssd' },
  ] : [
    { label: 'ID', key: 'barcode' },
    { label: 'Name', key: 'name' },
    { label: 'Location', key: 'location' },
    { label: 'Assigned To', key: 'assignedTo' },
    { label: 'Stock', key: 'stock' },
    { label: 'Condition', key: 'condition' },
  ];

  const filtered = items.filter(item => {
    const matchCat = item.category === selectedCat;
    const q = search.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(q) || 
                       item.barcode.toLowerCase().includes(q) ||
                       (item.processor?.toLowerCase().includes(q) || false);
    return matchCat && matchSearch;
  });

  const handleManualAdd = () => {
    if (!name) return;
    const newItem: ProcurementItem = {
      id: Date.now().toString(),
      name,
      assignedTo,
      location,
      category: selectedCat,
      photoUrl: null,
      barcode: `UNIV-${selectedCat.substring(0,2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: 1,
      reorderLevel: 0,
      condition: 'New',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
      office, idara, seatings, processor, ram, hdd, ssd
    };
    onAdd(newItem);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setAssignedTo(''); setLocation(''); setOffice('');
    setIdara(''); setSeatings(''); setProcessor(''); setRam(''); setHdd(''); setSsd('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError(null);
    }
  };

  const handleImport = async () => {
    if (!importFile || !window.XLSX) return;
    setIsImporting(true);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) throw new Error('Excel sheet is empty');

        const newItems = jsonData.map((row: any) => {
          // Normalize keys (handle spaces and case)
          const normalized: any = {};
          Object.keys(row).forEach(key => {
            const k = key.trim().toLowerCase();
            normalized[k] = row[key];
          });

          const itemName = normalized.asset || normalized.name || normalized.item;
          if (!itemName) throw new Error('Missing "Asset" column in your Excel file. Please ensure the first row contains: Office, Idara, Seatings, Asset, Processor, Ram, Hdd, Ssd');

          return {
            name: String(itemName),
            assignedTo: String(normalized['assigned to'] || normalized.assigned || 'Unassigned'),
            location: String(normalized.location || 'General'),
            category: selectedCat,
            photoUrl: null,
            barcode: `UNIV-${selectedCat.substring(0,2).toUpperCase()}-${Math.floor(Math.random()*10000)}`,
            stock: 1,
            reorderLevel: 0,
            condition: 'New' as const,
            office: normalized.office ? String(normalized.office) : undefined,
            idara: normalized.idara ? String(normalized.idara) : undefined,
            seatings: normalized.seatings || normalized.seating || normalized.seating_info ? String(normalized.seatings || normalized.seating || normalized.seating_info) : undefined,
            processor: normalized.processor ? String(normalized.processor) : undefined,
            ram: normalized.ram ? String(normalized.ram) : undefined,
            hdd: normalized.hdd ? String(normalized.hdd) : undefined,
            ssd: normalized.ssd ? String(normalized.ssd) : undefined
          };
        });

        onBulkAdd(newItems);
        setShowImportModal(false);
        setImportFile(null);
      } catch (err: any) {
        setImportError(err.message);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(importFile);
  };

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(230, 126, 34, 0.1)', color: '#e67e22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Category Management</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <select 
                className="input-field" 
                style={{ width: 'auto', padding: '4px 32px 4px 12px', fontSize: 13, height: 'auto', background: 'var(--bg-surface)' }}
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value as any)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>Schema: {selectedCat === 'IT Equipment' ? 'Technical' : 'Standard'}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowImportModal(true)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileUp size={18} /> Import Excel
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            className="input-field" 
            style={{ paddingLeft: 42 }} 
            placeholder={`Search ${selectedCat} assets...`} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bright-panel" style={{ padding: 0, overflowX: 'auto', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: selectedCat === 'IT Equipment' ? 1200 : 800 }}>
          <thead>
            <tr style={{ background: '#e67e22' }}>
              {headers.map(h => (
                <th key={h.key} style={{ 
                  padding: '14px 16px', 
                  textAlign: 'left', 
                  fontSize: 12, 
                  fontWeight: 900, 
                  color: 'white',
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    {h.label}
                    <ChevronDown size={14} style={{ opacity: 0.6 }} />
                  </div>
                </th>
              ))}
              <th style={{ padding: '14px 16px', background: '#e67e22' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} style={{ padding: 80, textAlign: 'center', color: 'var(--text-dim)', fontSize: 15, fontWeight: 600 }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
                  No items found in {selectedCat}.<br/>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Start by adding a new entry or importing an Excel file.</span>
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                  {headers.map(h => (
                    <td key={h.key} style={{ padding: '14px 16px', fontSize: 13, color: h.key === 'name' ? 'var(--primary-vivid)' : 'var(--text-main)', fontWeight: h.key === 'name' ? 800 : 500 }}>
                      {(item as any)[h.key] || '-'}
                    </td>
                  ))}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button className="btn-icon" style={{ opacity: 0.5 }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bright-panel" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Add New {selectedCat} Entry</h3>
                <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ padding: 8 }}><X size={20}/></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Asset Name *</label>
                  <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dell Optiplex 7090" />
                </div>

                {selectedCat === 'IT Equipment' ? (
                  <>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Office</label>
                      <input className="input-field" value={office} onChange={e => setOffice(e.target.value)} placeholder="Office" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Idara</label>
                      <input className="input-field" value={idara} onChange={e => setIdara(e.target.value)} placeholder="Idara" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Seatings</label>
                      <input className="input-field" value={seatings} onChange={e => setSeatings(e.target.value)} placeholder="Seating" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Processor</label>
                      <input className="input-field" value={processor} onChange={e => setProcessor(e.target.value)} placeholder="e.g. i7" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>RAM</label>
                      <input className="input-field" value={ram} onChange={e => setRam(e.target.value)} placeholder="e.g. 16GB" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>HDD</label>
                      <input className="input-field" value={hdd} onChange={e => setHdd(e.target.value)} placeholder="e.g. 1TB" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>SSD</label>
                      <input className="input-field" value={ssd} onChange={e => setSsd(e.target.value)} placeholder="e.g. 512GB" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Assigned To</label>
                      <input className="input-field" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Person Name" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Location</label>
                      <input className="input-field" value={location} onChange={e => setLocation(e.target.value)} placeholder="Room/Block" />
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleManualAdd} className="bright-button" style={{ flex: 2 }}>Save Entry</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bright-panel" style={{ width: '100%', maxWidth: 450, padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Excel Import</h3>
                <button onClick={() => setShowImportModal(false)} className="btn-ghost" style={{ padding: 8 }}><X size={20}/></button>
              </div>
              
              <div style={{ textAlign: 'center', padding: '30px 20px', border: '2px dashed var(--border-strong)', borderRadius: 16, background: 'rgba(0,0,0,0.02)', marginBottom: 20 }}>
                <FileUp size={48} color="var(--primary)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 20 }}>
                  Upload your <span style={{ color: 'var(--text-main)' }}>.xlsx</span> or <span style={{ color: 'var(--text-main)' }}>.csv</span> file for <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedCat}</span>
                </p>
                <label className="bright-button" style={{ display: 'inline-flex', cursor: 'pointer', fontSize: 13, padding: '10px 20px' }}>
                  {importFile ? importFile.name : 'Choose File'}
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>

              {importError && (
                <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 20, fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {importError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowImportModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleImport} disabled={!importFile || isImporting} className="bright-button" style={{ flex: 1 }}>
                  {isImporting ? 'Processing...' : 'Start Import'}
                </button>
              </div>

              <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(212,175,55,0.05)', borderRadius: 10, border: '1px solid rgba(212,175,55,0.1)' }}>
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>Expected Headers (First Row):</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, lineHeight: 1.4 }}>
                  Office, Idara, Seatings, Asset, Processor, Ram, Hdd, Ssd
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
