import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Filter, ArrowUpDown, ChevronRight, 
  BarChart3, Box, MapPin, AlertTriangle, RefreshCw, 
  Download, Tag, LogOut, LayoutGrid, List, Plus
} from 'lucide-react';
import { ProcurementItem, MaintenanceRecord } from '../store/appStore';
import UserAvatar from '../components/UserAvatar';
import AddItemFlow from '../components/AddItemFlow';

interface Props {
  items: ProcurementItem[];
  maintenance: MaintenanceRecord[];
  serverOnline: boolean | null;
  currentUser: any;
  onLogout: () => void;
  onAddItem: (item: any) => void;
  onBulkAdd?: (items: any[]) => void;
}

export default function InventoryApp({ items, maintenance, serverOnline, currentUser, onLogout, onAddItem, onBulkAdd }: Props) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'newest'>('newest');
  const [isAdding, setIsAdding] = useState(false);

  const categories = ['All', ...new Set(items.map(i => i.category))];

  const filteredItems = items
    .filter(i => 
      (catFilter === 'All' || i.category === catFilter) &&
      (i.name.toLowerCase().includes(search.toLowerCase()) || i.barcode.includes(search))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return b.stock - a.stock;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const lowStock = items.filter(i => i.stock <= i.reorderLevel).length;

  return (
    <div className="layout-shell">
      {/* ─── Sidebar ─── */}
      <aside className="layout-sidebar" style={{ width: 280 }}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
            <Box size={20} color="#0c0e14" />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">Inventory</div>
            <div className="sidebar-brand-sub" style={{ color: '#818cf8' }}>Control Center</div>
          </div>
        </div>

        <div style={{ padding: '24px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Overview</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="bright-panel" style={{ padding: 16, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Assets</span>
                <Package size={14} color="var(--primary)" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{items.length}</div>
            </div>

            <div className="bright-panel" style={{ padding: 16, background: lowStock > 0 ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Low Stock</span>
                <AlertTriangle size={14} color={lowStock > 0 ? '#f87171' : 'var(--text-dim)'} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: lowStock > 0 ? '#f87171' : 'var(--text-main)' }}>{lowStock}</div>
            </div>
          </div>
        </div>

        <div className="sidebar-nav" style={{ padding: '0 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, marginLeft: 10 }}>Categories</div>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`sidebar-nav-item ${catFilter === cat ? 'active' : ''}`}
              style={{ padding: '8px 14px' }}
            >
              <Tag size={16} />
              <span>{cat}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.6 }}>{cat === 'All' ? items.length : items.filter(i => i.category === cat).length}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <UserAvatar user={currentUser} size={36} />
            <div className="sidebar-user-info">
              <div style={{ fontSize: 13, fontWeight: 700 }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800 }}>INVENTORY MGR</div>
            </div>
          </div>
          <button onClick={onLogout} className="btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="layout-main" style={{ marginLeft: 280 }}>
        <header className="layout-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
            <div style={{ position: 'relative', maxWidth: 400, flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                className="input-field" 
                placeholder="Search inventory by name or barcode..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="chip chip-blue">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: serverOnline ? '#34d399' : '#f87171' }} />
              Inventory Portal
            </div>
            <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
              <button onClick={() => setView('grid')} style={{ padding: 6, borderRadius: 6, border: 'none', background: view === 'grid' ? 'var(--bg-elevated)' : 'transparent', color: view === 'grid' ? 'var(--primary)' : 'var(--text-dim)', cursor: 'pointer' }}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setView('list')} style={{ padding: 6, borderRadius: 6, border: 'none', background: view === 'list' ? 'var(--bg-elevated)' : 'transparent', color: view === 'list' ? 'var(--primary)' : 'var(--text-dim)', cursor: 'pointer' }}>
                <List size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="layout-content">
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div
                key="add-flow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 24 }}>
                  <button onClick={() => setIsAdding(false)} className="btn-ghost" style={{ fontSize: 12 }}>
                    <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Catalog
                  </button>
                </div>
                <AddItemFlow 
                  categories={categories.filter(c => c !== 'All')} 
                  onAdd={(item) => {
                    onAddItem(item);
                  }}
                  onBulkAdd={onBulkAdd}
                  onDone={() => setIsAdding(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="catalog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Inventory Catalog</h1>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: 0 }}>Manage and monitor stock levels across all locations.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <select 
                className="input-field" 
                style={{ width: 'auto', fontSize: 12, padding: '8px 32px 8px 12px' }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="stock">Highest Stock</option>
              </select>
              <button onClick={() => setIsAdding(true)} className="bright-button" style={{ padding: '8px 16px', fontSize: 12 }}>
                <Plus size={14} /> Add Item
              </button>
              <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className={view === 'grid' ? 'bento-grid' : ''} style={view === 'list' ? { display: 'flex', flexDirection: 'column', gap: 12 } : {}}>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bright-panel"
                  style={{
                    padding: view === 'grid' ? 20 : '14px 20px',
                    display: 'flex',
                    flexDirection: view === 'grid' ? 'column' : 'row',
                    alignItems: view === 'grid' ? 'flex-start' : 'center',
                    gap: 16,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    width: view === 'grid' ? 48 : 40, 
                    height: view === 'grid' ? 48 : 40, 
                    borderRadius: 12, 
                    background: 'var(--bg-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)',
                    flexShrink: 0
                  }}>
                    <Package size={20} color="var(--primary)" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{item.name}</h3>
                      <span className="chip chip-gold" style={{ fontSize: 10, fontFamily: 'DM Mono' }}>{item.barcode}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} /> {item.location}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={10} /> {item.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: view === 'grid' ? 'row' : 'row', 
                    alignItems: 'center', 
                    gap: 20,
                    width: view === 'grid' ? '100%' : 'auto',
                    marginTop: view === 'grid' ? 12 : 0,
                    paddingTop: view === 'grid' ? 12 : 0,
                    borderTop: view === 'grid' ? '1px solid var(--border)' : 'none'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>Stock Level</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${Math.min((item.stock / (item.reorderLevel * 2 || 100)) * 100, 100)}%`, 
                            height: '100%', 
                            background: item.stock <= item.reorderLevel ? 'var(--danger)' : 'var(--primary)' 
                          }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: item.stock <= item.reorderLevel ? 'var(--danger)' : 'var(--text-main)' }}>{item.stock}</span>
                      </div>
                    </div>
                    <button className="btn-icon" title="Edit Item">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredItems.length === 0 && (
              <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-dim)' }}>
                <Search size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                <div style={{ fontSize: 16, fontWeight: 600 }}>No items found</div>
                <p style={{ fontSize: 14 }}>Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
          </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
