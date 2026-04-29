import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, User, Building2, CreditCard, Package, Truck, FileText, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { procurementOrders } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const order = procurementOrders.find(o => o.id === orderId);
  const [showItems, setShowItems] = useState(true);

  if (!order) return <div style={{ padding: 20, color: '#8b949e' }}>Order not found</div>;

  const timeline = [
    { label: 'Request Submitted', date: order.requestDate, done: true, icon: FileText },
    { label: 'Pending Approval', date: '', done: order.status !== 'draft', icon: User },
    { label: 'Approved', date: order.approvalDate || '', done: ['approved', 'delivered'].includes(order.status), icon: CheckCircle, failed: order.status === 'rejected' },
    { label: 'Delivered', date: '', done: order.status === 'delivered', icon: Package },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #2a3441', position: 'sticky', top: 0, background: '#0d1117', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#e6edf3" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.title}</div>
          <div style={{ fontSize: 12, color: '#8b949e' }}>{order.poNumber}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Vendor + Amount Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, #161b22, #1e2530)', border: '1px solid #2a3441', borderRadius: 18, padding: 20, marginBottom: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '1px solid #2a3441' }}>
              {order.vendorLogo}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#e6edf3' }}>{order.vendor}</div>
              <div style={{ fontSize: 13, color: '#8b949e', marginTop: 2 }}>{order.category}</div>
              <PriorityBadge priority={order.priority} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, color: '#4d5f70', marginBottom: 2 }}>Total Amount</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e6edf3', fontFamily: 'DM Mono, monospace' }}>
                ${order.totalAmount.toLocaleString()}
                <span style={{ fontSize: 14, color: '#8b949e', fontWeight: 400, fontFamily: 'DM Sans, sans-serif' }}> {order.currency}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#4d5f70' }}>Items</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{order.lineItems.length}</div>
            </div>
          </div>
          {order.status !== 'draft' && order.status !== 'rejected' && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#8b949e' }}>Order Progress</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>{order.progress}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${order.progress}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{ background: order.progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { icon: User, label: 'Requested By', value: order.requestedBy },
            { icon: Building2, label: 'Department', value: order.department },
            { icon: Calendar, label: 'Request Date', value: order.requestDate },
            { icon: Calendar, label: 'Required By', value: order.requiredDate },
            { icon: CreditCard, label: 'Payment Terms', value: order.paymentTerms },
            { icon: CheckCircle, label: 'Approved By', value: order.approvedBy || '—' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <item.icon size={13} color="#4d5f70" />
                <span style={{ fontSize: 11, color: '#4d5f70' }}>{item.label}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', gap: 10 }}>
          <MapPin size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 11, color: '#4d5f70', marginBottom: 2 }}>Delivery Address</div>
            <div style={{ fontSize: 13, color: '#e6edf3' }}>{order.deliveryAddress}</div>
          </div>
        </div>

        {/* Tracking */}
        {order.trackingNumber && (
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={16} color="#3b82f6" />
            <div>
              <div style={{ fontSize: 11, color: '#60a5fa', marginBottom: 1 }}>Tracking Number</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', fontFamily: 'DM Mono, monospace' }}>{order.trackingNumber}</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: '0 0 16px' }}>Order Timeline</h3>
          <div style={{ position: 'relative' }}>
            {timeline.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < timeline.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: step.failed ? 'rgba(239,68,68,0.2)' : step.done ? 'rgba(34,197,94,0.15)' : '#1e2530',
                    border: `2px solid ${step.failed ? '#ef4444' : step.done ? '#22c55e' : '#2a3441'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {step.failed ? <XCircle size={14} color="#ef4444" /> : <step.icon size={13} color={step.done ? '#22c55e' : '#4d5f70'} />}
                  </div>
                  {i < timeline.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: step.done ? '#22c55e' : '#2a3441', minHeight: 16, marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: step.done ? '#e6edf3' : '#4d5f70' }}>{step.label}</div>
                  {step.date && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 1 }}>{step.date}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line Items */}
        <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <button
            onClick={() => setShowItems(!showItems)}
            style={{ background: 'none', border: 'none', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: 0, marginBottom: showItems ? 14 : 0 }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Line Items ({order.lineItems.length})</h3>
            {showItems ? <ChevronUp size={16} color="#8b949e" /> : <ChevronDown size={16} color="#8b949e" />}
          </button>
          {showItems && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.lineItems.map((item, i) => (
                <div key={item.id} style={{ background: '#0d1117', borderRadius: 10, padding: 12, border: '1px solid #2a3441' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{item.description}</div>
                      <div style={{ fontSize: 11, color: '#4d5f70', marginTop: 2 }}>{item.category}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', fontFamily: 'DM Mono, monospace', marginLeft: 8 }}>${item.total.toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 12, color: '#8b949e' }}>Qty: <strong style={{ color: '#e6edf3' }}>{item.quantity} {item.unit}</strong></span>
                    <span style={{ fontSize: 12, color: '#8b949e' }}>Unit: <strong style={{ color: '#e6edf3' }}>${item.unitPrice.toLocaleString()}</strong></span>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #2a3441', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#4d5f70', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} />
              Notes
            </div>
            <p style={{ fontSize: 13, color: '#8b949e', margin: 0, lineHeight: 1.6 }}>{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        {order.status === 'pending' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '13px', color: '#22c55e', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Approve</button>
            <button style={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '13px', color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✗ Reject</button>
          </div>
        )}
        {order.status === 'draft' && (
          <button className="primary-btn">Submit for Approval</button>
        )}
      </div>
    </div>
  );
}
