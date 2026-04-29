import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Camera, X, Upload, Clock } from 'lucide-react';
import { Complaint } from '../store/appStore';

interface Props {
  complaints: Complaint[];
  onResolve: (id: string, note: string, photo: string | null) => void;
}

export default function AdminComplaints({ complaints, onResolve }: Props) {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [resolving, setResolving] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [resolvePhoto, setResolvePhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

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
    setResolvePhoto(canvas.toDataURL('image/jpeg', 0.8));
    closeCamera();
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setResolvePhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submitResolve = (id: string) => {
    onResolve(id, note, resolvePhoto);
    setResolving(null);
    setNote('');
    setResolvePhoto(null);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      {cameraOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ flex: 1, objectFit: 'cover', width: '100%' }} />
          <div style={{ padding: 20, display: 'flex', gap: 12 }}>
            <button onClick={closeCamera} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={capture} className="bright-button" style={{ flex: 2 }}>📸 Capture Proof</button>
          </div>
        </div>
      )}

      <div style={{ padding: '0 0 24px' }}>
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '0 0 16px', fontWeight: 500 }}>Review and resolve issues raised by supervisors</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'open', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 20, border: filter === f ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border-strong)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', background: filter === f ? 'rgba(212,175,55,0.08)' : 'var(--bg-surface)', color: filter === f ? 'var(--primary-vivid)' : 'var(--text-dim)', transition: 'all 0.2s' }}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bright-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <div style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 600 }}>No {filter !== 'all' ? filter : ''} complaints found</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bright-panel" style={{ 
              overflow: 'hidden', 
              borderLeft: c.priority === 'CRITICAL' ? '4px solid #ef4444' : 
                          c.priority === 'HIGH' ? '4px solid #f97316' : 
                          c.status === 'open' ? '3px solid #f87171' : '3px solid #34d399' 
            }}>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{c.itemName}</div>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900, 
                      background: c.priority === 'CRITICAL' ? '#fee2e2' : c.priority === 'HIGH' ? '#ffedd5' : '#f1f5f9',
                      color: c.priority === 'CRITICAL' ? '#ef4444' : c.priority === 'HIGH' ? '#f97316' : 'var(--text-dim)'
                    }}>
                      {c.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'DM Mono, monospace', marginTop: 2, fontWeight: 700 }}>{c.itemBarcode}</div>
                </div>
                <span className={`chip ${c.status === 'open' ? 'chip-red' : 'chip-green'}`} style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                  {c.status === 'open' ? '⚠ Open Issue' : '✓ Resolved'}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: '0 0 14px', lineHeight: 1.6, fontWeight: 500 }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Clock size={12} /> {c.raisedAt}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>📍 {c.location}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>👤 {c.raisedBy}</span>
              </div>
              {c.status === 'resolved' && (
                <div style={{ marginTop: 16, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#34d399', marginBottom: 6, fontWeight: 800 }}>✓ Resolved by {c.resolvedBy} · {c.resolvedAt}</div>
                  {c.resolvedNote && <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{c.resolvedNote}</div>}
                  {c.resolvedPhotoUrl && <img src={c.resolvedPhotoUrl} alt="resolved" style={{ width: '100%', borderRadius: 10, marginTop: 12, maxHeight: 180, objectFit: 'cover', border: '1px solid var(--border)' }} />}
                </div>
              )}
            </div>

            {/* Resolve panel */}
            {c.status === 'open' && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px', background: 'var(--bg-surface)' }}>
                {resolving === c.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <textarea className="input-field" placeholder="Describe the resolution..." value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ resize: 'none' }} />
                    {resolvePhoto ? (
                      <div style={{ position: 'relative' }}>
                        <img src={resolvePhoto} alt="proof" style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: 180, objectFit: 'cover', border: '1px solid var(--border)' }} />
                        <button onClick={() => setResolvePhoto(null)} className="btn-icon" style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 30, height: 30 }}><X size={14} color="white" /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={openCamera} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', borderStyle: 'dashed', color: 'var(--primary)' }}><Camera size={14} /> Camera</button>
                        <button onClick={() => fileRef.current?.click()} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', borderStyle: 'dashed', color: 'var(--primary)' }}><Upload size={14} /> Upload</button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => { setResolving(null); setNote(''); setResolvePhoto(null); }} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                      <button onClick={() => submitResolve(c.id)} className="bright-button" style={{ flex: 2 }}>Mark as Resolved</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setResolving(c.id)} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
                    <CheckCircle size={16} /> Resolve Complaint
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
