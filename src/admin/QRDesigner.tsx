import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Tag, Settings, Layout, Type, Palette, QrCode, Download } from 'lucide-react';

export default function QRDesigner() {
  const [labelSize, setLabelSize] = useState('standard'); // standard, small, large
  const [showPrice, setShowPrice] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [accentColor, setAccentColor] = useState('#D4AF37');

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Smart QR Label Designer</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '4px 0 0' }}>Create and customize high-quality asset tags for physical items.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ fontSize: 12 }}>
            <Download size={14} /> Export Template
          </button>
          <button className="bright-button" style={{ fontSize: 12, padding: '10px 20px' }}>
            <Printer size={14} /> Print All Labels
          </button>
        </div>
      </div>

      <div className="bento-grid-2" style={{ gridTemplateColumns: '350px 1fr', gap: 32 }}>
        {/* Editor Controls */}
        <div className="bright-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layout size={12} /> Label Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {['Small', 'Standard', 'Large'].map(size => (
                <button
                  key={size}
                  onClick={() => setLabelSize(size.toLowerCase())}
                  style={{
                    padding: '10px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: labelSize === size.toLowerCase() ? 'var(--primary-light)' : 'var(--bg-surface)',
                    color: labelSize === size.toLowerCase() ? 'var(--primary-vivid)' : 'var(--text-dim)',
                    border: `1px solid ${labelSize === size.toLowerCase() ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Type size={12} /> Content Visibility
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show Asset Value</span>
                <input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show Location</span>
                <input type="checkbox" checked={showLocation} onChange={e => setShowLocation(e.target.checked)} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Palette size={12} /> Brand Color
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['#D4AF37', '#6366f1', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: accentColor === c ? '3px solid white' : 'none', cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="bright-panel" style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', borderStyle: 'dashed' }}>
          <motion.div
            layout
            style={{
              width: labelSize === 'small' ? 240 : labelSize === 'standard' ? 320 : 400,
              aspectRatio: '2/1.2',
              background: 'white',
              borderRadius: 4,
              padding: 20,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              color: '#0c0e14',
              position: 'relative'
            }}
          >
            {/* Left Section: Info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 12, height: 12, background: accentColor, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '1px', opacity: 0.8 }}>TANZEEM ASSET</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>Dell Latitude 5420 Laptop</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: 700 }}>SN: LPT-2024-0012</div>
              </div>
              
              <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>
                {showLocation && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Tag size={8} /> Location: CS Lab Room 201</div>}
                {showPrice && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><QrCode size={8} /> Value: ₹45,000</div>}
              </div>
            </div>

            {/* Right Section: QR */}
            <div style={{ width: '35%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px dashed #e2e8f0', marginLeft: 16, paddingLeft: 16 }}>
              <div style={{ width: '100%', aspectRatio: '1', background: '#f8fafc', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size="80%" strokeWidth={1.5} color="#0c0e14" />
              </div>
              <div style={{ fontSize: 8, fontWeight: 800, marginTop: 8, color: accentColor }}>SCAN TO REPORT</div>
            </div>
            
            {/* Cut Line indicator */}
            <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'rotate(90deg)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '4px' }}>- - - CUT - - -</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
