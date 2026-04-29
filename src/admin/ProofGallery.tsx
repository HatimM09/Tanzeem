import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Calendar, MapPin, User, CheckCircle } from 'lucide-react';
import { Complaint } from '../store/appStore';

interface Props {
  complaints: Complaint[];
}

export default function ProofGallery({ complaints }: Props) {
  const resolvedWithPhotos = complaints.filter(c => c.status === 'resolved' && c.resolvedPhotoUrl);
  const [selected, setSelected] = useState<Complaint | null>(null);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Visual Proof Gallery</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '4px 0 0', fontWeight: 600 }}>
          Before and After accountability records for resolved issues.
        </p>
      </div>

      {resolvedWithPhotos.length === 0 ? (
        <div className="bright-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Image size={48} color="var(--border)" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 700 }}>No resolution proof photos found</div>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>Photos uploaded during complaint resolution will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {resolvedWithPhotos.map((c, i) => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: i * 0.05 }}
              className="bright-panel" 
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setSelected(c)}
            >
              <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                <img src={c.resolvedPhotoUrl!} alt={c.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(16,185,129,0.9)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> RESOLVED
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{c.itemName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>{c.resolvedNote || 'No resolution note provided.'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>{c.resolvedAt}</span>
                  <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800 }}>{c.resolvedBy}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSelected(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bright-panel" 
              style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Resolution Details</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={24} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                <img src={selected.resolvedPhotoUrl!} alt="resolution" style={{ width: '100%', borderRadius: 16, marginBottom: 24, boxShadow: 'var(--shadow-lg)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  {[
                    { icon: Image, label: 'Item Name', value: selected.itemName },
                    { icon: MapPin, label: 'Location', value: selected.location },
                    { icon: User, label: 'Resolved By', value: selected.resolvedBy },
                    { icon: Calendar, label: 'Resolution Date', value: selected.resolvedAt },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Icon size={14} color="var(--primary)" />
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>{label}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>Resolution Note</div>
                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 12, padding: 16, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.6 }}>
                    {selected.resolvedNote}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
