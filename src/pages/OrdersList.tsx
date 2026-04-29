import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, ChevronRight } from 'lucide-react';
import { procurementOrders, ProcurementStatus } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const filters: { label: string; value: ProcurementStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Draft', value: 'draft' },
  { label: 'Rejected', value: 'rejected' },
];

interface OrdersListProps {
  onViewOrder: (id: string) => void;
  onNewOrder: () => void;
}

export default function OrdersList({ onViewOrder, onNewOrder }: OrdersListProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProcurementStatus | 'all'>('all');

  const filtered = procurementOrders.filter(o => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' || o.status === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="fade-in" style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Orders</h1>
        <button
          onClick={onNewOrder}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={18} color="white" />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#4d5f70" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 40 }}
            placeholder="Search orders, vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              background: activeFilter === f.value ? '#3b82f6' : '#1e2530',
              color: activeFilter === f.value ? 'white' : '#8b949e',
              transition: 'all 0.2s',
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Count */}
      <div style={{ padding: '0 20px 12px' }}>
        <span style={{ fontSize: 12, color: '#4d5f70' }}>{filtered.length} order{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Orders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onViewOrder(order.id)}
            style={{ background: '#161b22', borderRadius: 16, padding: 16, border: '1px solid #2a3441', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {order.vendorLogo}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{order.title}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 1 }}>{order.poNumber}</div>
                </div>
              </div>
              <ChevronRight size={16} color="#4d5f70" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <StatusBadge status={order.status} />
              <PriorityBadge priority={order.priority} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#4d5f70' }}>Vendor</div>
                <div style={{ fontSize: 13, color: '#8b949e' }}>{order.vendor}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#4d5f70' }}>Amount</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>${order.totalAmount.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#4d5f70' }}>Due</div>
                <div style={{ fontSize: 13, color: '#8b949e' }}>{order.requiredDate}</div>
              </div>
            </div>
            {order.status !== 'draft' && order.status !== 'rejected' && (
              <div style={{ marginTop: 12 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${order.progress}%`, background: order.progress === 100 ? '#22c55e' : '#3b82f6' }} />
                </div>
                <div style={{ fontSize: 11, color: '#4d5f70', marginTop: 4, textAlign: 'right' }}>{order.progress}% complete</div>
              </div>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4d5f70' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#8b949e', marginBottom: 4 }}>No orders found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
          </div>
        )}
      </div>
    </div>
  );
}
