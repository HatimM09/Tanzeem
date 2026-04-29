import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, MapPin, Tag, User, Camera,
  CheckCircle, ArrowRight, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import { ProcurementItem, ProcurementCategory } from '../store/appStore';

const categories: ProcurementCategory[] = [
  'Furniture', 'IT Equipment', 'Lab Equipment', 'Library', 'Sports',
  'Stationery', 'Electrical', 'Maintenance', 'Other',
];

interface Props {
  onAdd: (item: ProcurementItem) => void;
  onDone: () => void;
}

export default function AddProcurement({ onAdd, onDone }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ProcurementCategory>('IT Equipment');
  const [photo, setPhoto] = useState<string | null>(null);
  const [stock, setStock] = useState(1);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [condition, setCondition] = useState<'New' | 'Good' | 'Fair' | 'Poor' | 'Critical'>('New');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateBarcode = () => {
    const prefix = category.substring(0, 2).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `UNIV-${prefix}-${random}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newItem: ProcurementItem = {
      id: Date.now().toString(),
      name,
      assignedTo,
      location,
      category,
      photoUrl: photo,
      barcode: generateBarcode(),
      stock,
      reorderLevel,
      condition,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
    };

    setTimeout(() => {
      onAdd(newItem);
      setStep(3);
      setIsSubmitting(false);
    }, 1200);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 40 }}>
      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: step >= s
              ? 'linear-gradient(90deg, var(--primary), var(--primary-vivid))'
              : 'var(--border-strong)',
            transition: 'all 0.5s ease',
            boxShadow: step >= s ? '0 0 8px rgba(212,175,55,0.3)' : 'none',
          }} />
        ))}
      </div>

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Register New Item</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '6px 0 0', fontWeight: 500 }}>Add a new asset or sync from IT Category sheet</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            const url = prompt('Enter your Google Sheet URL (Published as CSV):');
            if (!url) return;
            try {
              setIsSubmitting(true);
              const res = await api.sync.googleSheets(url);
              alert(`Success! Imported ${res.added} IT items directly into inventory.`);
              onDone(); // Redirect to library to see items
            } catch (err: any) {
              alert(`Sync Failed: ${err.message}`);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="btn-ghost"
          style={{ fontSize: 11, background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--primary-vivid)' }}
        >
          <RefreshCw size={14} className={isSubmitting ? 'spin' : ''} /> Sync Google Sheet
        </motion.button>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="bright-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Package size={12} /> Procurement Name *
              </label>
              <input className="input-field" placeholder="e.g. Dell Monitor 24 inch" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <MapPin size={12} /> Block
                </label>
                <select className="input-field" value={location.split(' - ')[0] || ''} onChange={e => setLocation(`${e.target.value}${location.includes(' - ') ? ' - ' + location.split(' - ')[1] : ''}`)}>
                  <option value="">Select Block</option>
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="Main Hall">Main Hall</option>
                  <option value="Library">Library</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <MapPin size={12} /> Room
                </label>
                <input className="input-field" placeholder="e.g. Room 201" value={location.split(' - ')[1] || ''} onChange={e => setLocation(`${location.split(' - ')[0] || ''} - ${e.target.value}`)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Tag size={12} /> Category *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{
                    padding: '8px 4px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: '1px solid',
                    borderColor: category === cat ? 'rgba(212,175,55,0.3)' : 'var(--border-strong)',
                    background: category === cat ? 'rgba(212,175,55,0.08)' : 'var(--bg-surface)',
                    color: category === cat ? 'var(--primary-vivid)' : 'var(--text-dim)',
                    transition: 'all 0.2s',
                  }}>{cat}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setStep(2)} disabled={!name || !location} className="bright-button" style={{
            padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14,
            opacity: (!name || !location) ? 0.4 : 1,
          }}>
            Continue to Details <ArrowRight size={18} />
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="bright-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <User size={12} /> Assigned To
              </label>
              <input className="input-field" placeholder="e.g. Dr. Salman Ahmed" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Package size={12} /> Stock Qty
                </label>
                <input type="number" className="input-field" value={stock} onChange={e => setStock(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <CheckCircle size={12} /> Condition
                </label>
                <select className="input-field" value={condition} onChange={e => setCondition(e.target.value as any)}>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Camera size={12} /> Attach Photo
              </label>
              <div style={{
                position: 'relative', height: 180, borderRadius: 'var(--radius-lg)',
                border: '2px dashed var(--border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-surface)', overflow: 'hidden',
              }}>
                {photo ? (
                  <>
                    <img src={photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => setPhoto(null)} style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 8,
                      padding: 6, color: 'white', cursor: 'pointer',
                    }}>Change</button>
                  </>
                ) : (
                  <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Camera size={32} color="var(--text-dim)" />
                    <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>Click to upload</span>
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1 }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="bright-button" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {isSubmitting ? <><RefreshCw size={16} className="spin" /> Processing...</> : <><CheckCircle size={16} /> Register Item</>}
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={36} color="#34d399" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>Registration Successful</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 30, fontWeight: 500 }}>The item has been added to the inventory library.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => { setStep(1); setName(''); setLocation(''); setAssignedTo(''); setPhoto(null); }} className="bright-button">Add Another Item</button>
            <button onClick={onDone} className="btn-ghost" style={{ justifyContent: 'center' }}>Go to Inventory</button>
          </div>
        </motion.div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
