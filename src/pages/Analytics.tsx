import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart2, PieChart } from 'lucide-react';
import { procurementOrders, dashboardStats } from '../data/mockData';

const categorySpend = [
  { label: 'IT Equipment', amount: 71150, pct: 42, color: '#3b82f6' },
  { label: 'Office Supplies', amount: 3240, pct: 8, color: '#06b6d4' },
  { label: 'Safety Equipment', amount: 8960, pct: 18, color: '#22c55e' },
  { label: 'Furniture', amount: 15800, pct: 16, color: '#a78bfa' },
  { label: 'Marketing', amount: 5600, pct: 10, color: '#f59e0b' },
  { label: 'Services', amount: 3000, pct: 6, color: '#f97316' },
];

const monthlyData = [
  { month: 'Jan', amount: 28 }, { month: 'Feb', amount: 42 }, { month: 'Mar', amount: 35 },
  { month: 'Apr', amount: 58 }, { month: 'May', amount: 71 }, { month: 'Jun', amount: 49 },
];

export default function Analytics() {
  const maxBar = Math.max(...monthlyData.map(d => d.amount));

  return (
    <div className="fade-in" style={{ paddingBottom: 90 }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Analytics</h1>
        <p style={{ color: '#4d5f70', fontSize: 13, marginTop: 4 }}>Spend analysis & insights</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '0 20px 20px' }}>
        {[
          { label: 'Total Orders', value: dashboardStats.totalOrders, change: '+12%', up: true },
          { label: 'Avg Order', value: '$6.1k', change: '-4%', up: false },
          { label: 'Savings', value: '$34.2k', change: '+18%', up: true },
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#4d5f70', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {kpi.up ? <TrendingUp size={11} color="#22c55e" /> : <TrendingDown size={11} color="#ef4444" />}
              <span style={{ fontSize: 11, color: kpi.up ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Spend Chart */}
      <div style={{ margin: '0 20px 20px', background: '#161b22', border: '1px solid #2a3441', borderRadius: 18, padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={16} color="#3b82f6" /> Monthly Spend ($k)
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
          {monthlyData.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.amount / maxBar) * 80}px` }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{ width: '100%', borderRadius: '4px 4px 0 0', background: i === monthlyData.length - 1 ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)' : '#1e2530', minHeight: 4 }}
              />
              <span style={{ fontSize: 10, color: '#4d5f70' }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ margin: '0 20px 20px', background: '#161b22', border: '1px solid #2a3441', borderRadius: 18, padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <PieChart size={16} color="#06b6d4" /> Spend by Category
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categorySpend.map((cat, i) => (
            <div key={cat.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                  <span style={{ fontSize: 13, color: '#e6edf3' }}>{cat.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>${(cat.amount / 1000).toFixed(1)}k</span>
                  <span style={{ fontSize: 11, color: '#4d5f70', marginLeft: 6 }}>{cat.pct}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.pct}%` }}
                  transition={{ delay: i * 0.1, duration: 0.7 }}
                  style={{ background: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{ margin: '0 20px', background: '#161b22', border: '1px solid #2a3441', borderRadius: 18, padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: '0 0 16px' }}>Order Status Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Delivered', count: 2, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Approved', count: 1, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Pending', count: 1, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Draft', count: 1, color: '#8b949e', bg: 'rgba(139,148,158,0.1)' },
            { label: 'Rejected', count: 1, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Cancelled', count: 0, color: '#4d5f70', bg: 'rgba(77,95,112,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
