import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, MapPin, User, Tag } from 'lucide-react';
import { ScanRecord } from '../store/appStore';

interface Props { records: ScanRecord[]; }

export default function ScanHistory({ records }: Props) {
  const [filter, setFilter] = useState<'all' | 'found' | 'notfound'>('all');

  const filtered = records.filter(r =>
    filter === 'all' ? true : filter === 'found' ? r.item !== null : r.item === null
  );

  const categoryColors: Record<string, string> = {
    'IT Equipment': '#818cf8', 'Furniture': '#fbbf24', 'Lab Equipment': '#22d3ee',
    'Library': '#34d399', 'Sports': '#fb923c', 'Stationery': '#c084fc',
    'Electrical': '#facc15', 'Maintenance': '#f87171', 'Other': '#94a3b8',
  };

  return (
    <div className="fade-in" style={{ paddingBottom: 20 }}>
      <div style={{ padding: '20px 20px 14px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>Scan History</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '0 0 14px' }}>{records.length} scans recorded</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'found', 'notfound'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 20, border: filter === f ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-strong)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: filter === f ? 'rgba(16,185,129,0.1)' : 'var(--bg-surface)', color: filter === f ? '#34d399' : 'var(--text-dim)', transition: 'all 0.2s' }}>
              {f === 'all' ? 'All' : f === 'found' ? '✓ Matched' : '✗ Not Found'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>No scan records yet</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {[...filtered].reverse().map((record, i) => (
          <motion.div key={record.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            style={{ background: 'var(--bg-card)', border: `1px solid ${record.item ? 'var(--border)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: record.item ? `${categoryColors[record.item.category] || '#6366f1'}20` : 'rgba(239,68,68,0.1)' }}>
                {record.item
                  ? <CheckCircle size={20} color={categoryColors[record.item.category] || '#6366f1'} />
                  : <XCircle size={20} color="#ef4444" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {record.item ? record.item.name : 'Unknown Barcode'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>{record.barcode}</div>
                {record.item && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {record.item.location}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}><User size={10} /> {record.item.assignedTo}</span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Clock size={10} /> {record.scannedAt}</div>
                {record.item && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${categoryColors[record.item.category] || '#6366f1'}20`, color: categoryColors[record.item.category] || '#6366f1', marginTop: 4, display: 'inline-block' }}>{record.item.category}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
