import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Camera, Upload, X, Plus, Clock } from 'lucide-react';
import { ProcurementItem, Complaint } from '../store/appStore';

interface Props {
  items: ProcurementItem[];
  complaints: Complaint[];
  onRaise: (c: Complaint) => void;
}

export default function RaiseComplaint({ items, complaints, onRaise }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementItem | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [catFilter, setCatFilter] = useState('ALL');

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch { alert('Camera not available. Use file upload.'); }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
    setPhoto(canvas.toDataURL('image/jpeg', 0.8));
    closeCamera();
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!selectedItem || !description.trim()) return;
    const complaint: Complaint = {
      id: 'cmp' + Date.now(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemBarcode: selectedItem.barcode,
      location: selectedItem.location,
      description: description.trim(),
      priority: 'MEDIUM',
      raisedBy: 'Supervisor',
      raisedAt: new Date().toLocaleString(),
      status: 'open',
    };
    onRaise(complaint);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); setSelectedItem(null); setDescription(''); setPhoto(null); }, 2000);
  };

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="fade-in" style={{ paddingBottom: 20 }}>
      {cameraOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-main)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ flex: 1, objectFit: 'cover', width: '100%' }} />
          <div style={{ padding: 20, display: 'flex', gap: 12 }}>
            <button onClick={closeCamera} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={capture} className="bright-button" style={{ flex: 2, background: 'linear-gradient(135deg, var(--primary), var(--primary-vivid))' }}>📸 Capture</button>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>Daily Complaints</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>{complaints.filter(c => c.status === 'open').length} open · {complaints.filter(c => c.status === 'resolved').length} resolved</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setSubmitted(false); }} className={showForm ? 'btn-ghost' : 'bright-button'} style={{ color: showForm ? 'var(--danger)' : '#0c0e14', borderColor: showForm ? 'rgba(239,68,68,0.3)' : 'none', padding: '10px 14px', fontSize: 13 }}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Raise</>}
        </button>
      </div>

      {/* Raise Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ margin: '0 20px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: 16 }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle size={36} color="var(--secondary)" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Complaint Raised!</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>Admin has been notified.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>Filter by Category</label>
                    <select 
                      className="input-field" 
                      style={{ marginBottom: 12 }}
                      onChange={(e) => setCatFilter(e.target.value)}
                      value={catFilter}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Furniture">Furniture</option>
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Lab Equipment">Lab Equipment</option>
                      <option value="Library">Library</option>
                      <option value="Sports">Sports</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Other">Other</option>
                    </select>

                    <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>Select Item *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                      {items
                        .filter(item => catFilter === 'ALL' || item.category === catFilter)
                        .map(item => (
                        <button key={item.id} onClick={() => setSelectedItem(item)} style={{ background: selectedItem?.id === item.id ? 'var(--primary-light)' : 'var(--bg-surface)', border: `1px solid ${selectedItem?.id === item.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>📍 {item.location}</div>
                          </div>
                          {selectedItem?.id === item.id && <CheckCircle size={16} color="var(--primary)" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8 }}>Complaint Description *</label>
                    <textarea className="input-field" placeholder="Describe the issue in detail..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8 }}>Attach Photo (optional)</label>
                    {photo ? (
                      <div style={{ position: 'relative' }}>
                        <img src={photo} alt="complaint" style={{ width: '100%', borderRadius: 10, maxHeight: 120, objectFit: 'cover' }} />
                        <button onClick={() => setPhoto(null)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} color="white" /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={openCamera} style={{ flex: 1, background: '#1a2235', border: '1px dashed #1e2d45', borderRadius: 10, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: '#94a3b8', fontSize: 12, fontFamily: 'inherit' }}><Camera size={14} /> Camera</button>
                        <button onClick={() => fileRef.current?.click()} style={{ flex: 1, background: '#1a2235', border: '1px dashed #1e2d45', borderRadius: 10, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: '#94a3b8', fontSize: 12, fontFamily: 'inherit' }}><Upload size={14} /> Upload</button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                      </div>
                    )}
                  </div>
                  <button onClick={handleSubmit} disabled={!selectedItem || !description.trim()} className="bright-button" style={{ background: !selectedItem || !description.trim() ? 'var(--bg-surface)' : 'linear-gradient(135deg, var(--danger), #b91c1c)', color: !selectedItem || !description.trim() ? 'var(--text-dim)' : 'white', fontSize: 15, padding: '14px' }}>
                    <AlertTriangle size={16} /> Submit Complaint
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px' }}>
        {(['all', 'open', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 20, border: filter === f ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border-strong)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', background: filter === f ? 'var(--primary-light)' : 'var(--bg-surface)', color: filter === f ? 'var(--primary-vivid)' : 'var(--text-dim)', transition: 'all 0.2s' }}>{f}</button>
        ))}
      </div>

      {/* Complaints list */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <div style={{ fontSize: 14, color: '#475569' }}>No {filter !== 'all' ? filter : ''} complaints</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {[...filtered].reverse().map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bright-panel" style={{ borderLeft: `4px solid ${c.status === 'open' ? 'var(--danger)' : 'var(--secondary)'}`, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{c.itemName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>📍 {c.location}</div>
              </div>
              <span className={`chip ${c.status === 'open' ? 'chip-red' : 'chip-green'}`} style={{ fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {c.status === 'open' ? '⚠ Open' : '✓ Resolved'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 8px', lineHeight: 1.5 }}>{c.description}</p>
            <div style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {c.raisedAt}</div>
            {c.status === 'resolved' && (
              <div style={{ marginTop: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#10b981', marginBottom: 4 }}>✓ Resolved · {c.resolvedAt}</div>
                {c.resolvedNote && <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.resolvedNote}</div>}
                {c.resolvedPhotoUrl && <img src={c.resolvedPhotoUrl} alt="resolved" style={{ width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 100, objectFit: 'cover' }} />}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
