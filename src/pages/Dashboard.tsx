import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingCart, Clock, CheckCircle, AlertTriangle, Users, DollarSign, Package } from 'lucide-react';
import { dashboardStats, procurementOrders } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';

const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

interface DashboardProps {
  onViewOrder: (id: string) => void;
  onNavigate: (tab: 'dashboard' | 'orders' | 'vendors' | 'analytics') => void;
}

export default function Dashboard({ onViewOrder, onNavigate }: DashboardProps) {
  const stats = dashboardStats;
  const recentOrders = procurementOrders.slice(0, 4);

  const statCards = [
    { label: 'Total Spend', value: fmt(stats.totalSpend), icon: DollarSign, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Pending', value: stats.pendingApproval, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'On-Time %', value: `${stats.onTimeDelivery}%`, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Vendors', value: stats.activeVendors, icon: Users, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 2 }}>Good morning 👋</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Dashboard</h1>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>JC</div>
        </div>
        <p style={{ color: '#4d5f70', fontSize: 13, margin: '4px 0 20px' }}>May 20, 2024 · {stats.ordersThisMonth} orders this month</p>
      </div>

      {/* Budget Progress */}
      <div style={{ margin: '0 20px 20px' }}>
        <div style={{ background: '#161b22', borderRadius: 16, padding: 16, border: '1px solid #2a3441' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: '#8b949e', fontSize: 13 }}>Budget Utilization</span>
            <span style={{ color: '#e6edf3', fontSize: 13, fontWeight: 600 }}>{stats.budgetUsed}% used</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${stats.budgetUsed}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ background: stats.budgetUsed > 80 ? '#ef4444' : stats.budgetUsed > 60 ? '#f59e0b' : '#3b82f6' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ color: '#4d5f70', fontSize: 11 }}>Spent: {fmt(stats.totalSpend)}</span>
            <span style={{ color: '#4d5f70', fontSize: 11 }}>Budget: {fmt(Math.round(stats.totalSpend / stats.budgetUsed * 100))}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '0 20px 24px' }}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ background: '#161b22', borderRadius: 14, padding: 16, border: '1px solid #2a3441' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Savings Banner */}
      <div style={{ margin: '0 20px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color="#22c55e" />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#8b949e' }}>Savings Achieved</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{fmt(stats.savingsAchieved)} <span style={{ fontSize: 12, color: '#8b949e', fontWeight: 400 }}>vs. market rate</span></div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Recent Orders</h2>
          <button onClick={() => onNavigate('orders' as 'orders')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>View all →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              onClick={() => onViewOrder(order.id)}
              style={{ background: '#161b22', borderRadius: 14, padding: '14px 16px', border: '1px solid #2a3441', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {order.vendorLogo}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.title}</div>
                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{order.poNumber} · {order.vendor}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>${order.totalAmount.toLocaleString()}</div>
                <StatusBadge status={order.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
