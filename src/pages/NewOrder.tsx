import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface NewOrderProps {
  onBack: () => void;
}

const categories = ['IT Equipment', 'Office Supplies', 'Furniture', 'Safety Equipment', 'Marketing', 'Services', 'Other'];
const departments = ['Engineering', 'Operations', 'IT Infrastructure', 'Facilities', 'Marketing', 'HR', 'Finance'];
const priorities = ['low', 'medium', 'high', 'critical'] as const;
const paymentTerms = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immediate'];

export default function NewOrder({ onBack }: NewOrderProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', vendor: '', category: categories[0], department: departments[0],
    priority: 'medium' as const, requiredDate: '', paymentTerms: paymentTerms[1],
    deliveryAddress: '', notes: '',
  });
  const [items, setItems] = useState([{ description: '', quantity: 1, unit: 'units', unitPrice: 0 }]);
  const [submitted, setSubmitted] = useState(false);

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit: 'units', unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const next = [...items];
    (next[i] as any)[field] = value;
    setItems(next);
  };

  if (submitted) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 32, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>✓</div>
        </motion.div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Order Submitted!</h2>
        <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Your procurement request has been submitted for approval. You'll be notified when it's reviewed.</p>
        <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 14, padding: 16, marginBottom: 28, width: '100%' }}>
          <div style={{ fontSize: 13, color: '#4d5f70', marginBottom: 4 }}>Total Amount</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${total.toLocaleString()}</div>
        </div>
        <button onClick={onBack} className="primary-btn">Back to Orders</button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 100 }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #2a3441', position: 'sticky', top: 0, background: '#0d1117', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#e6edf3" />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>New Purchase Order</h1>
      </div>

      {/* Step Indicator */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#3b82f6' : '#2a3441', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#8b949e', marginTop: 8 }}>Step {step} of 3 · {['Order Details', 'Line Items', 'Review'][step - 1]}</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Order Title *</label>
                <input className="input-field" placeholder="e.g. Laptop Fleet Refresh" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Vendor Name *</label>
                <input className="input-field" placeholder="Vendor name" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ appearance: 'none' }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Department</label>
                  <select className="input-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={{ appearance: 'none' }}>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {priorities.map(p => (
                    <button key={p} onClick={() => setForm({ ...form, priority: p as any })}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s',
                        borderColor: form.priority === p ? '#3b82f6' : '#2a3441',
                        background: form.priority === p ? 'rgba(59,130,246,0.15)' : '#1e2530',
                        color: form.priority === p ? '#60a5fa' : '#8b949e',
                      }}>{p}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Required Date</label>
                  <input className="input-field" type="date" value={form.requiredDate} onChange={e => setForm({ ...form, requiredDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Payment Terms</label>
                  <select className="input-field" value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} style={{ appearance: 'none' }}>
                    {paymentTerms.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Delivery Address</label>
                <input className="input-field" placeholder="Full delivery address" value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea className="input-field" placeholder="Additional notes or requirements..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ resize: 'none' }} />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, i) => (
                <div key={i} style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#8b949e' }}>Item {i + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="input-field" placeholder="Item description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#4d5f70', display: 'block', marginBottom: 4 }}>Qty</label>
                        <input className="input-field" type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#4d5f70', display: 'block', marginBottom: 4 }}>Unit</label>
                        <input className="input-field" placeholder="units" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#4d5f70', display: 'block', marginBottom: 4 }}>Unit Price</label>
                        <input className="input-field" type="number" min={0} value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>= ${(item.quantity * item.unitPrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1e2530', border: '1px dashed #2a3441', borderRadius: 14, padding: 14, color: '#8b949e', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Plus size={16} /> Add Line Item
              </button>
              <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: '0 0 14px' }}>Order Summary</h3>
              {[
                ['Title', form.title || '—'],
                ['Vendor', form.vendor || '—'],
                ['Category', form.category],
                ['Department', form.department],
                ['Priority', form.priority],
                ['Required Date', form.requiredDate || '—'],
                ['Payment Terms', form.paymentTerms],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #2a3441' }}>
                  <span style={{ fontSize: 13, color: '#4d5f70' }}>{label}</span>
                  <span style={{ fontSize: 13, color: '#e6edf3', fontWeight: 600, textTransform: 'capitalize' }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', margin: '0 0 12px' }}>Line Items ({items.length})</h3>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #2a3441' }}>
                  <span style={{ fontSize: 13, color: '#8b949e' }}>{item.description || `Item ${i + 1}`} ×{item.quantity}</span>
                  <span style={{ fontSize: 13, color: '#e6edf3', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>${(item.quantity * item.unitPrice).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>Grand Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={{ flex: 1, background: '#1e2530', border: '1px solid #2a3441', borderRadius: 12, padding: 14, color: '#e6edf3', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="primary-btn" style={{ flex: 2 }}>Continue →</button>
          ) : (
            <button onClick={() => setSubmitted(true)} className="primary-btn" style={{ flex: 2 }}>Submit Order</button>
          )}
        </div>
      </div>
    </div>
  );
}
