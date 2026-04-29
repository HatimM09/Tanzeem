import React from 'react';
import { motion } from 'framer-motion';
import { Star, Phone, Mail, Package, TrendingUp } from 'lucide-react';
import { vendors } from '../data/mockData';

export default function VendorsList() {
  return (
    <div className="fade-in" style={{ paddingBottom: 90 }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Vendors</h1>
        <p style={{ color: '#4d5f70', fontSize: 13, marginTop: 4 }}>{vendors.length} active vendors</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 20px' }}>
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 18, padding: 18, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '1px solid #2a3441', flexShrink: 0 }}>
                {vendor.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>{vendor.name}</div>
                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{vendor.category}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={12} color={idx < Math.floor(vendor.rating) ? '#f59e0b' : '#2a3441'} fill={idx < Math.floor(vendor.rating) ? '#f59e0b' : 'transparent'} />
                  ))}
                  <span style={{ fontSize: 12, color: '#f59e0b', marginLeft: 4, fontWeight: 600 }}>{vendor.rating}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: '#0d1117', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Package size={12} color="#3b82f6" />
                  <span style={{ fontSize: 11, color: '#4d5f70' }}>Total Orders</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3' }}>{vendor.totalOrders}</div>
              </div>
              <div style={{ background: '#0d1117', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <TrendingUp size={12} color="#22c55e" />
                  <span style={{ fontSize: 11, color: '#4d5f70' }}>On-Time</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{vendor.onTimeDelivery}%</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #2a3441', paddingTop: 12, display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, padding: '9px', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Phone size={13} /> {vendor.contact}
              </button>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, padding: '9px', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Mail size={13} /> Email
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
