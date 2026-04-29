import React from 'react';

const priorityConfig = {
  low: { label: 'Low', color: '#8b949e', bg: 'rgba(139,148,158,0.1)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  high: { label: 'High', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' | 'critical' }) {
  const cfg = priorityConfig[priority];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 20,
        fontSize: 11, fontWeight: 600,
        color: cfg.color, background: cfg.bg,
      }}
    >
      {priority === 'critical' && '⚡'} {cfg.label}
    </span>
  );
}
