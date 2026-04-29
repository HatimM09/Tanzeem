import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { ScannedProduct } from '../data/productDatabase';

export interface CartItem {
  product: ScannedProduct;
  quantity: number;
}

interface ProcurementCartProps {
  cart: CartItem[];
  onUpdateQty: (barcode: string, qty: number) => void;
  onRemove: (barcode: string) => void;
  onClearCart: () => void;
  onBack: () => void;
}

export default function ProcurementCart({ cart, onUpdateQty, onRemove, onClearCart, onBack }: ProcurementCartProps) {
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState('');
  const [dept, setDept] = useState('Engineering');

  const total = cart.reduce((s, i) => s + i.product.unitPrice * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (submitted) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 32, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>✓</div>
        </motion.div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Order Submitted!</h2>
        <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Your scanned procurement request has been submitted for approval.</p>
        <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 14, padding: 16, marginBottom: 28, width: '100%' }}>
          <div style={{ fontSize: 12, color: '#4d5f70', marginBottom: 4 }}>{itemCount} items · {cart.length} products</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${total.toLocaleString()}</div>
        </div>
        <button onClick={() => { onClearCart(); onBack(); }} className="primary-btn">Back to Scanner</button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="fade-in" style={{ paddingBottom: 90 }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #2a3441' }}>
          <button onClick={onBack} style={{ background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#e6edf3" />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Procurement Cart</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Cart is empty</div>
          <div style={{ fontSize: 13, color: '#4d5f70', marginBottom: 24 }}>Scan barcodes to add items</div>
          <button onClick={onBack} className="primary-btn" style={{ maxWidth: 200 }}>Go to Scanner</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 160 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #2a3441', position: 'sticky', top: 0, background: '#0d1117', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#e6edf3" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Procurement Cart</h1>
          <div style={{ fontSize: 12, color: '#8b949e' }}>{itemCount} items · {cart.length} products</div>
        </div>
        <button onClick={onClearCart} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear</button>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <AnimatePresence>
            {cart.map((item, i) => (
              <motion.div
                key={item.product.barcode}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 16, overflow: 'hidden' }}
              >
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid #2a3441', flexShrink: 0 }}>
                      {item.product.vendorLogo}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', lineHeight: 1.3 }}>{item.product.name}</div>
                      <div style={{ fontSize: 11, color: '#4d5f70', marginTop: 2, fontFamily: 'DM Mono, monospace' }}>{item.product.sku}</div>
                    </div>
                    <button onClick={() => onRemove(item.product.barcode)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                      <Trash2 size={15} color="#4d5f70" />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#0d1117', borderRadius: 10, border: '1px solid #2a3441', overflow: 'hidden' }}>
                      <button onClick={() => onUpdateQty(item.product.barcode, item.quantity - 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ minWidth: 30, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.product.barcode, item.quantity + 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#4d5f70' }}>${item.product.unitPrice} × {item.quantity}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${(item.product.unitPrice * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Meta */}
        <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: '0 0 12px' }}>Order Details</h3>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Department</label>
            <select className="input-field" value={dept} onChange={e => setDept(e.target.value)} style={{ appearance: 'none' }}>
              {['Engineering', 'Operations', 'IT Infrastructure', 'Facilities', 'Marketing', 'HR', 'Finance'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Notes</label>
            <textarea className="input-field" placeholder="Add notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ resize: 'none' }} />
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#8b949e' }}>Subtotal ({itemCount} items)</span>
            <span style={{ fontSize: 13, color: '#e6edf3', fontFamily: 'DM Mono, monospace' }}>${total.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#8b949e' }}>Est. Tax (8%)</span>
            <span style={{ fontSize: 13, color: '#e6edf3', fontFamily: 'DM Mono, monospace' }}>${Math.round(total * 0.08).toLocaleString()}</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(59,130,246,0.2)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${Math.round(total * 1.08).toLocaleString()}</span>
          </div>
        </div>

        <button onClick={() => setSubmitted(true)} style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: 14, padding: '16px', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Send size={18} /> Submit Procurement Order
        </button>
      </div>
    </div>
  );
}
