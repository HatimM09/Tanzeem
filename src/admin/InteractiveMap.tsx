import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, AlertTriangle, Box } from 'lucide-react';
import { ProcurementItem } from '../store/appStore';

interface Props {
  items: ProcurementItem[];
}

export default function InteractiveMap({ items }: Props) {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Group items by location for the map
  const locationMap: Record<string, { items: ProcurementItem[], x: number, y: number }> = {
    'CS Lab - Room 201': { items: [], x: 25, y: 30 },
    'Faculty Office - Block A': { items: [], x: 65, y: 25 },
    'Electronics Lab - Room 105': { items: [], x: 25, y: 70 },
    'Auditorium - Main Hall': { items: [], x: 80, y: 60 },
    'Central Library': { items: [], x: 45, y: 55 },
    'Main Corridor - Block B': { items: [], x: 50, y: 85 },
  };

  items.forEach(item => {
    if (locationMap[item.location]) {
      locationMap[item.location].items.push(item);
    }
  });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Campus Distribution Map</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '4px 0 0' }}>Real-time visualization of assets across blocks.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-dim)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} /> Assets
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-dim)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)' }} /> Issues
          </div>
        </div>
      </div>

      <div className="bright-panel" style={{ position: 'relative', height: 500, background: 'var(--bg-surface)', padding: 0, overflow: 'hidden', border: '1px solid var(--border-strong)' }}>
        {/* Abstract Map Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.5 }} />
        
        {/* Map Elements (Simplified blocks) */}
        <div style={{ position: 'absolute', top: '15%', left: '15%', width: '30%', height: '30%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <span style={{ position: 'absolute', top: 10, left: 14, fontSize: 10, fontWeight: 800, color: 'var(--text-dim)' }}>BLOCK A</span>
        </div>
        <div style={{ position: 'absolute', top: '15%', right: '10%', width: '35%', height: '45%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <span style={{ position: 'absolute', top: 10, left: 14, fontSize: 10, fontWeight: 800, color: 'var(--text-dim)' }}>BLOCK B</span>
        </div>
        <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '40%', height: '30%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <span style={{ position: 'absolute', top: 10, left: 14, fontSize: 10, fontWeight: 800, color: 'var(--text-dim)' }}>LAB COMPLEX</span>
        </div>

        {/* Hotspots */}
        {Object.entries(locationMap).map(([loc, data]) => {
          const hasIssues = data.items.some(i => i.condition === 'Poor' || i.condition === 'Critical');
          return (
            <motion.div
              key={loc}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2, zIndex: 10 }}
              onClick={() => setSelectedPoint({ loc, ...data })}
              style={{
                position: 'absolute',
                left: `${data.x}%`,
                top: `${data.y}%`,
                width: 24,
                height: 24,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '100%', height: '100%',
                background: hasIssues ? 'var(--danger)' : 'var(--primary)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${hasIssues ? 'rgba(239,68,68,0.4)' : 'rgba(212,175,55,0.4)'}`,
                border: '3px solid var(--bg-surface)'
              }}>
                <MapPin size={12} color="#0c0e14" strokeWidth={3} />
              </div>
              {data.items.length > 0 && (
                <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--text-main)', color: 'var(--bg-main)', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 10 }}>
                  {data.items.length}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Info Overlay */}
        <AnimatePresence>
          {selectedPoint && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              style={{
                position: 'absolute', top: 20, right: 20, bottom: 20, width: 280,
                background: 'var(--glass-strong)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-strong)', borderRadius: 20,
                padding: 24, zIndex: 20, display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{selectedPoint.loc}</h3>
                <button onClick={() => setSelectedPoint(null)} className="btn-icon" style={{ width: 24, height: 24 }}>×</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedPoint.items.map((i: ProcurementItem) => (
                  <div key={i.id} style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{i.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="chip" style={{ fontSize: 9, background: 'var(--bg-surface)' }}>{i.category}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: i.condition === 'New' || i.condition === 'Good' ? '#34d399' : '#f87171' }}>
                        {i.condition}
                      </span>
                    </div>
                  </div>
                ))}
                {selectedPoint.items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>No items in this zone.</div>
                )}
              </div>

              <button className="bright-button" style={{ marginTop: 20, width: '100%', fontSize: 12 }}>
                VIEW ZONE DETAILS
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
