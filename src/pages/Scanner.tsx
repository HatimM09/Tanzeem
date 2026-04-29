import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Scan, Zap, ZapOff, RotateCcw, X, CheckCircle, AlertTriangle, ShoppingCart, History, Flashlight } from 'lucide-react';
import { productDatabase, demoBarcodes, ScannedProduct, ScanHistoryItem } from '../data/productDatabase';

interface ScannerProps {
  onAddToCart: (product: ScannedProduct, quantity: number) => void;
  scanHistory: ScanHistoryItem[];
  onAddHistory: (item: ScanHistoryItem) => void;
  onNavigate: (tab: 'dashboard' | 'orders' | 'vendors' | 'analytics' | 'scan') => void;
}

export default function Scanner({ onAddToCart, scanHistory, onAddHistory, onNavigate }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [tab, setTab] = useState<'scan' | 'history'>('scan');
  const scanLineAnim = useRef<number | null>(null);

  const stopScanner = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleBarcode = useCallback((code: string) => {
    stopScanner();
    setScannedCode(code);
    const found = productDatabase[code] || null;
    setProduct(found);
    setNotFound(!found);
    setQuantity(1);

    const histItem: ScanHistoryItem = {
      id: Date.now().toString(),
      barcode: code,
      product: found,
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quantity: 1,
      addedToCart: false,
    };
    onAddHistory(histItem);
  }, [stopScanner, onAddHistory]);

  const startScanner = useCallback(async () => {
    setScannedCode(null);
    setProduct(null);
    setNotFound(false);
    setCameraError(null);
    setAddedFeedback(false);

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      setScanning(true);

      await reader.decodeFromVideoDevice(
        null,
        videoRef.current!,
        (result, err) => {
          if (result) {
            handleBarcode(result.getText());
          }
        }
      );
    } catch (err: any) {
      setCameraError(err?.message || 'Camera access denied');
      setScanning(false);
    }
  }, [handleBarcode]);

  const handleDemoScan = () => {
    const code = demoBarcodes[demoIndex % demoBarcodes.length];
    setDemoIndex(i => i + 1);
    handleBarcode(code);
  };

  const handleAddToCart = () => {
    if (!product) return;
    onAddToCart(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleReset = () => {
    setScannedCode(null);
    setProduct(null);
    setNotFound(false);
    setAddedFeedback(false);
    setQuantity(1);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const stockColor = product
    ? product.stock <= product.reorderLevel
      ? '#ef4444'
      : product.stock <= product.reorderLevel * 2
      ? '#f59e0b'
      : '#22c55e'
    : '#8b949e';

  return (
    <div className="fade-in" style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Barcode Scanner</h1>
          <p style={{ color: '#4d5f70', fontSize: 13, marginTop: 3 }}>Scan items to add to procurement</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scan size={20} color="white" />
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', margin: '0 20px 16px', background: '#161b22', borderRadius: 12, padding: 4, border: '1px solid #2a3441' }}>
        {(['scan', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            background: tab === t ? '#3b82f6' : 'transparent',
            color: tab === t ? 'white' : '#4d5f70',
            transition: 'all 0.2s',
          }}>{t === 'scan' ? '📷 Scan' : `🕒 History (${scanHistory.length})`}</button>
        ))}
      </div>

      {tab === 'scan' && (
        <div style={{ padding: '0 20px' }}>
          {/* Camera Viewport */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#0d1117', border: '1px solid #2a3441', marginBottom: 16, aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }}
              autoPlay
              muted
              playsInline
            />

            {/* Idle state */}
            {!scanning && !scannedCode && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Scan size={32} color="#3b82f6" />
                </motion.div>
                <p style={{ color: '#4d5f70', fontSize: 13, margin: 0 }}>Tap below to start scanning</p>
              </div>
            )}

            {/* Scanning overlay */}
            {scanning && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {/* Corner brackets */}
                {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
                  <div key={`${v}${h}`} style={{
                    position: 'absolute',
                    [v]: 28, [h]: 28,
                    width: 28, height: 28,
                    borderTop: v === 'top' ? '3px solid #3b82f6' : 'none',
                    borderBottom: v === 'bottom' ? '3px solid #3b82f6' : 'none',
                    borderLeft: h === 'left' ? '3px solid #3b82f6' : 'none',
                    borderRight: h === 'right' ? '3px solid #3b82f6' : 'none',
                    borderRadius: v === 'top' && h === 'left' ? '6px 0 0 0' : v === 'top' && h === 'right' ? '0 6px 0 0' : v === 'bottom' && h === 'left' ? '0 0 0 6px' : '0 0 6px 0',
                  }} />
                ))}
                {/* Scan line */}
                <motion.div
                  animate={{ top: ['30%', '70%', '30%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{ position: 'absolute', left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #3b82f6, transparent)', borderRadius: 1, boxShadow: '0 0 8px #3b82f6' }}
                />
                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 20 }}>Align barcode within frame</span>
                </div>
              </div>
            )}

            {/* Camera error */}
            {cameraError && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 }}>
                <AlertTriangle size={32} color="#f59e0b" />
                <p style={{ color: '#f59e0b', fontSize: 13, textAlign: 'center', margin: 0 }}>Camera unavailable: {cameraError}</p>
                <p style={{ color: '#4d5f70', fontSize: 12, textAlign: 'center', margin: 0 }}>Use Demo Mode below to simulate scanning</p>
              </div>
            )}
          </div>

          {/* Scan Controls */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {!scanning ? (
              <button
                onClick={startScanner}
                style={{ flex: 2, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: 14, padding: '15px', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Scan size={18} /> Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanner}
                style={{ flex: 2, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '15px', color: '#ef4444', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <X size={18} /> Stop
              </button>
            )}
            <button
              onClick={handleDemoScan}
              style={{ flex: 1, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 14, padding: '15px', color: '#06b6d4', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Zap size={15} /> Demo
            </button>
          </div>

          {/* Manual Barcode Entry */}
          <ManualEntry onScan={handleBarcode} />

          {/* Result Card */}
          <AnimatePresence>
            {scannedCode && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                style={{ marginTop: 16 }}
              >
                {product ? (
                  <ProductResultCard
                    product={product}
                    barcode={scannedCode}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    onAddToCart={handleAddToCart}
                    onReset={handleReset}
                    addedFeedback={addedFeedback}
                    stockColor={stockColor}
                  />
                ) : (
                  <NotFoundCard barcode={scannedCode} onReset={handleReset} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {tab === 'history' && (
        <ScanHistoryTab history={scanHistory} onRescan={handleBarcode} />
      )}
    </div>
  );
}

/* ── Manual Entry ── */
function ManualEntry({ onScan }: { onScan: (code: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        className="input-field"
        placeholder="Enter barcode manually..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && value.trim()) { onScan(value.trim()); setValue(''); } }}
        style={{ flex: 1, fontFamily: 'DM Mono, monospace', fontSize: 13 }}
      />
      <button
        onClick={() => { if (value.trim()) { onScan(value.trim()); setValue(''); } }}
        style={{ background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, padding: '0 14px', color: '#8b949e', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap' }}
      >Lookup</button>
    </div>
  );
}

/* ── Product Result Card ── */
function ProductResultCard({ product, barcode, quantity, setQuantity, onAddToCart, onReset, addedFeedback, stockColor }: any) {
  return (
    <div style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 18, overflow: 'hidden' }}>
      {/* Top accent */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid #2a3441' }}>
              {product.vendorLogo}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', lineHeight: 1.3 }}>{product.name}</div>
              <div style={{ fontSize: 11, color: '#4d5f70', marginTop: 2, fontFamily: 'DM Mono, monospace' }}>{product.sku}</div>
            </div>
          </div>
          <button onClick={onReset} style={{ background: '#1e2530', border: '1px solid #2a3441', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={13} color="#8b949e" />
          </button>
        </div>

        {/* Barcode display */}
        <div style={{ background: '#0d1117', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#4d5f70' }}>Barcode</span>
          <span style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#3b82f6', fontWeight: 600 }}>{barcode}</span>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div style={{ background: '#0d1117', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: '#4d5f70', marginBottom: 3 }}>Category</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{product.category}</div>
          </div>
          <div style={{ background: '#0d1117', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: '#4d5f70', marginBottom: 3 }}>Vendor</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{product.vendor}</div>
          </div>
          <div style={{ background: '#0d1117', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: '#4d5f70', marginBottom: 3 }}>Unit Price</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#3b82f6', fontFamily: 'DM Mono, monospace' }}>${product.unitPrice.toLocaleString()}</div>
          </div>
          <div style={{ background: '#0d1117', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: '#4d5f70', marginBottom: 3 }}>Stock Level</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: stockColor }}>
              {product.stock} <span style={{ fontSize: 11, fontWeight: 400, color: '#4d5f70' }}>{product.unit}s</span>
            </div>
          </div>
        </div>

        {/* Stock warning */}
        {product.stock <= product.reorderLevel && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: 12, color: '#ef4444' }}>Low stock — reorder recommended (level: {product.reorderLevel})</span>
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: 12, color: '#8b949e', margin: '0 0 14px', lineHeight: 1.6 }}>{product.description}</p>

        {/* Quantity selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: '#8b949e', flex: 1 }}>Quantity</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#0d1117', borderRadius: 10, border: '1px solid #2a3441', overflow: 'hidden' }}>
            <button onClick={() => setQuantity((q: number) => Math.max(1, q - 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <span style={{ minWidth: 36, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>{quantity}</span>
            <button onClick={() => setQuantity((q: number) => q + 1)} style={{ width: 36, height: 36, background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', fontFamily: 'DM Mono, monospace', minWidth: 70, textAlign: 'right' }}>
            ${(product.unitPrice * quantity).toLocaleString()}
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={onAddToCart}
          style={{
            width: '100%', borderRadius: 12, padding: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
            background: addedFeedback ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: addedFeedback ? '#22c55e' : 'white',
            outline: addedFeedback ? '1px solid rgba(34,197,94,0.3)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.3s',
          }}
        >
          {addedFeedback ? <><CheckCircle size={18} /> Added to Cart!</> : <><ShoppingCart size={18} /> Add to Procurement Cart</>}
        </button>
      </div>
    </div>
  );
}

/* ── Not Found Card ── */
function NotFoundCard({ barcode, onReset }: { barcode: string; onReset: () => void }) {
  return (
    <div style={{ background: '#161b22', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 18, padding: 20, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>🔍</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', margin: '0 0 6px' }}>Product Not Found</h3>
      <p style={{ fontSize: 13, color: '#8b949e', margin: '0 0 8px' }}>No product matched this barcode</p>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '6px 12px', display: 'inline-block', marginBottom: 16 }}>{barcode}</div>
      <button onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto', background: '#1e2530', border: '1px solid #2a3441', borderRadius: 10, padding: '10px 20px', color: '#8b949e', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
        <RotateCcw size={14} /> Scan Again
      </button>
    </div>
  );
}

/* ── Scan History Tab ── */
function ScanHistoryTab({ history, onRescan }: { history: ScanHistoryItem[]; onRescan: (code: string) => void }) {
  if (history.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#8b949e', marginBottom: 4 }}>No scans yet</div>
        <div style={{ fontSize: 13, color: '#4d5f70' }}>Scan a barcode to see history here</div>
      </div>
    );
  }
  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...history].reverse().map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{ background: '#161b22', border: '1px solid #2a3441', borderRadius: 14, padding: 14 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: item.product ? '#1e2530' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1px solid #2a3441' }}>
              {item.product ? item.product.vendorLogo : '❓'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.product ? item.product.name : 'Unknown Product'}
              </div>
              <div style={{ fontSize: 11, color: '#4d5f70', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>{item.barcode}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: '#4d5f70', marginBottom: 4 }}>{item.scannedAt}</div>
              <button
                onClick={() => onRescan(item.barcode)}
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '4px 10px', color: '#60a5fa', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
              >Rescan</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
