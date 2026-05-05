import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertCircle, Tag, CheckCircle, Printer, RefreshCw, TrendingUp, ArrowUpRight, Clock, MapPin } from 'lucide-react';
import { ProcurementItem, Complaint } from '../store/appStore';
import { api } from '../lib/api';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  'IT Equipment': '#818cf8',
  'Accessories': '#10b981',
  'Furniture': '#fbbf24',
  'Lab Equipment': '#22d3ee',
  'Library': '#34d399',
  'Sports': '#fb923c',
  'Stationery': '#c084fc',
  'Electrical': '#facc15',
  'Maintenance': '#f87171',
  'Other': '#94a3b8',
};

interface Props {
  items: ProcurementItem[];
  complaints: Complaint[];
  onNavigate: (tab: any) => void;
}

// ─── Interactive Donut Chart ─────────────────────────────────────────────────
function CategoryDonut({ data, total }: { data: [string, number][], total: number }) {
  let currentAngle = 0;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '12px 0' }}>
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <svg viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
          {data.map(([cat, count]) => {
            const percentage = (count / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -currentAngle;
            currentAngle += percentage;
            return (
              <circle
                key={cat}
                cx="21" cy="21" r="15.915"
                fill="transparent"
                stroke={categoryColors[cat] || '#94a3b8'}
                strokeWidth={hovered === cat ? '6' : '4.5'}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: hovered && hovered !== cat ? 0.4 : 1 }}
                onMouseEnter={() => setHovered(cat)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Items</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map(([cat, count]) => (
          <div
            key={cat}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8,
              background: hovered === cat ? 'rgba(255,255,255,0.03)' : 'transparent',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={() => setHovered(cat)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ width: 10, height: 10, borderRadius: 3, background: categoryColors[cat] || '#94a3b8', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flex: 1 }}>{cat}</span>
            <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 800 }}>{count}</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>{Math.round((count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Micro Bar Chart ─────────────────────────────────────────────────────────
function MiniBarChart() {
  const months = [
    { m: 'Jan', v: 45, i: 2 }, { m: 'Feb', v: 78, i: 5 }, { m: 'Mar', v: 32, i: 8 },
    { m: 'Apr', v: 92, i: 3 }, { m: 'May', v: 55, i: 12 }, { m: 'Jun', v: 67, i: 4 },
  ];
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', gap: 10, height: 140, alignItems: 'flex-end', paddingBottom: 20, position: 'relative' }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <div key={v} style={{ position: 'absolute', left: 0, right: 0, bottom: `${20 + (v / 100) * 120}px`, borderBottom: '1px solid var(--border)', opacity: 0.5 }} />
      ))}
      {months.map((d, idx) => (
        <div
          key={d.m}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {hoveredIdx === idx && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-vivid)', marginBottom: -2 }}>{d.v}</div>
          )}
          <div style={{ width: '100%', maxWidth: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 100, gap: 2, cursor: 'pointer' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${d.v}%` }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: hoveredIdx === idx
                  ? 'linear-gradient(180deg, var(--primary-vivid), var(--primary))'
                  : 'linear-gradient(180deg, rgba(212,175,55,0.6), rgba(212,175,55,0.3))',
                borderRadius: '4px 4px 0 0', width: '100%',
                transition: 'background 0.2s',
              }}
            />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${d.i * 5}%` }}
              transition={{ duration: 0.5, delay: idx * 0.08 + 0.1 }}
              style={{
                background: hoveredIdx === idx
                  ? 'linear-gradient(180deg, #f87171, #ef4444)'
                  : 'linear-gradient(180deg, rgba(239,68,68,0.5), rgba(239,68,68,0.25))',
                borderRadius: '0 0 4px 4px', width: '100%',
              }}
            />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: hoveredIdx === idx ? 'var(--text-main)' : 'var(--text-dim)', transition: 'color 0.2s' }}>{d.m}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard({ items, complaints, onNavigate }: Props) {
  const [syncing, setSyncing] = useState(false);
  const openComplaints = complaints.filter((c: Complaint) => c.status === 'open').length;
  const resolved = complaints.filter((c: Complaint) => c.status === 'resolved').length;

  const handlePrint = () => { window.print(); };

  const handleSync = async () => {
    const url = prompt('Enter your Google Sheet URL (Published as CSV):');
    if (!url) return;
    try {
      setSyncing(true);
      const res = await api.sync.googleSheets(url);
      alert(`Sync Successful! Added: ${res.added}, Updated: ${res.updated}`);
      window.location.reload();
    } catch (err: any) {
      alert(`Sync Failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const totalValue = items.length * 250;
  const catMap: Record<string, number> = {};
  items.forEach((i: ProcurementItem) => { catMap[i.category] = (catMap[i.category] || 0) + 1; });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const stats = [
    { label: 'Total Items', value: items.length, icon: Package, color: '#D4AF37', bg: 'rgba(212,175,55,0.08)', trend: '+12%' },
    { label: 'Open Issues', value: openComplaints, icon: AlertCircle, color: '#f87171', bg: 'rgba(239,68,68,0.08)', trend: openComplaints > 0 ? 'Active' : 'Clear' },
    { label: 'Resolved', value: resolved, icon: CheckCircle, color: '#22d3ee', bg: 'rgba(6,182,212,0.08)', trend: resolved > 0 ? '100%' : '—' },
  ];

  return (
    <div className="fade-in">
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 24 }}>
        <motion.button 
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('library')} 
          className="bright-button" 
          style={{ fontSize: 12, padding: '10px 16px' }}
        >
          <Tag size={14} /> Go to Inventory
        </motion.button>
        <motion.button 
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint} 
          className="btn-ghost" 
          style={{ fontSize: 12 }}
        >
          <Printer size={14} /> Print Report
        </motion.button>
      </div>

      {/* Priority Alerts */}
      {complaints.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH').length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {complaints.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH').map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))',
                border: '1px solid rgba(239,68,68,0.15)',
                padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={18} color="#f87171" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fca5a5' }}>CRITICAL: {c.itemName}</div>
                <div style={{ fontSize: 11, color: '#f87171', fontWeight: 600, opacity: 0.8 }}>{c.description}</div>
              </div>
              <button onClick={() => onNavigate('complaints')} className="bright-button" style={{ padding: '8px 14px', fontSize: 10, borderRadius: 8 }}>
                RESOLVE NOW
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Low Stock Alerts */}
      {items.filter(i => (i.stock || 1) <= 5 && ['Stationery', 'Maintenance', 'Electrical'].includes(i.category)).length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.filter(i => (i.stock || 1) <= 5 && ['Stationery', 'Maintenance', 'Electrical'].includes(i.category)).slice(0, 3).map(i => (
            <motion.div key={i.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))',
                border: '1px solid rgba(245,158,11,0.15)',
                padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} color="#f59e0b" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fcd34d' }}>LOW STOCK: {i.name}</div>
                <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, opacity: 0.8 }}>Only {i.stock || 1} units remaining in inventory</div>
              </div>
              <button onClick={() => onNavigate('library')} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 10, borderRadius: 8, color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>
                RESTOCK
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="bento-grid-3" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02, cursor: 'pointer' }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              if (s.label === 'Total Items') onNavigate('library');
              if (s.label === 'Open Issues' || s.label === 'Resolved') onNavigate('complaints');
            }}
            className="stat-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon-box" style={{ background: s.bg }}>
                <s.icon size={20} color={s.color} />
              </div>
              <span className="chip" style={{
                background: s.trend.includes('+') ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                color: s.trend.includes('+') ? '#34d399' : 'var(--text-dim)',
                fontSize: 10, fontWeight: 700,
              }}>
                {s.trend.includes('+') && <ArrowUpRight size={10} />}
                {s.trend}
              </span>
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label" style={{ marginTop: 4 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="bento-grid-2" style={{ marginBottom: 24 }}>
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bright-panel" style={{ padding: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Category Distribution</h3>
            <span className="chip chip-gold" style={{ fontSize: 9 }}>REAL-TIME</span>
          </div>
          {items.length > 0 ? (
            <CategoryDonut data={topCats} total={items.length} />
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)', fontSize: 13 }}>Add items to see analytics</div>
          )}
        </motion.div>

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bright-panel" style={{ padding: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Management Trends</h3>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--primary)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)' }}>Assets</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)' }}>Issues</span>
              </div>
            </div>
          </div>
          <MiniBarChart />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bright-panel" style={{ overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Recent Activity</h3>
          <motion.button 
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('library')} 
            className="btn-ghost" 
            style={{ padding: '6px 12px', fontSize: 11, border: 'none', color: 'var(--primary)' }}
          >
            VIEW ALL <ArrowUpRight size={12} />
          </motion.button>
        </div>
        {items.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: 0, padding: '40px 22px', textAlign: 'center' }}>No items in inventory.</p>}
        {items.slice(-5).reverse().map((item: ProcurementItem) => (
          <div key={item.id} className="feed-item">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${categoryColors[item.category] || '#D4AF37'}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Tag size={18} color={categoryColors[item.category] || '#D4AF37'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={10} /> {item.location}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span className="chip chip-gold" style={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }}>{item.barcode}</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={9} /> {item.createdAt}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
