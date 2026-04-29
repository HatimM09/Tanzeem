import React from 'react';
import type { ProcurementStatus } from '../data/mockData';

const statusConfig: Record<ProcurementStatus, { label: string; bg: string; color: string; dot: string }> = {
  draft: { label: 'Draft', bg: 'rgba(139,148,158,0.15)', color: '#8b949e', dot: '#8b949e' },
  pending: { label: 'Pending', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b' },
  approved: { label: 'Approved', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', dot: '#3b82f6' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.15)', color: '#ef4444', dot: '#ef4444' },
  delivered: { label: 'Delivered', bg: 'rgba(34,197,94,0.15)', color: '#22c55e', dot: '#22c55e' },
  cancelled: { label: 'Cancelled', bg: 'rgba(139,148,158,0.15)', color: '#8b949e', dot: '#8b949e' },
};

export default function StatusBadge({ status }: { status: ProcurementStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="status-badge"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}
