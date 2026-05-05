import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from '@zxing/library';
import {
  Scan, X, Zap, MapPin, User, Tag, Package,
  CheckCircle, AlertCircle, Wrench,
} from 'lucide-react';
import { ProcurementItem, ScanRecord } from '../store/appStore';
import MaintenanceLog, { MaintenanceEntry } from './MaintenanceLog';

interface Props {
  items: ProcurementItem[];
  onAddScan: (r: ScanRecord) => void;
  onItemScanned: (item: ProcurementItem | null) => void;
  onAddMaintenanceLog?: (entry: MaintenanceEntry) => void;
}

// Configure ZXing: PDF417 first, plus common formats, TRY_HARDER
function createReader(): BrowserMultiFormatReader {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.PDF_417,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints, 300);
}

const categoryColors: Record<string, string> = {
  'IT Equipment': '#818cf8', 'Furniture': '#fbbf24', 'Lab Equipment': '#22d3ee',
  'Library': '#34d399', 'Sports': '#fb923c', 'Stationery': '#c084fc',
  'Electrical': '#facc15', 'Maintenance': '#f87171', 'Other': '#94a3b8',
};

export default function SupervisorScanner({ items, onAddScan, onItemScanned, onAddMaintenanceLog }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning]       = useState(false);
  const [result, setResult]           = useState<{ barcode: string; item: ProcurementItem | null } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode]   = useState('');
  const [demoIdx, setDemoIdx]         = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);

  // Maintenance log view
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceItem, setMaintenanceItem] = useState<ProcurementItem | null>(null);

  const stopScanner = useCallback(() => {
    try { readerRef.current?.reset(); } catch {}
    readerRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  const handleBarcode = useCallback((code: string) => {
    const now = Date.now();
    if (now - lastScanTime < 1500) return;
    setLastScanTime(now);
    stopScanner();

    const found = items.find(i => i.barcode === code) || null;
    setResult({ barcode: code, item: found });
    onItemScanned(found);

    const record: ScanRecord = {
      id:        Date.now().toString(),
      barcode:   code,
      item:      found,
      scannedAt: new Date().toLocaleString(),
      scannedBy: 'Supervisor',
    };
    onAddScan(record);
  }, [items, stopScanner, onAddScan, onItemScanned, lastScanTime]);

  const startScanner = useCallback(async () => {
    setResult(null);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      const reader = createReader();
      readerRef.current = reader;
      setScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      reader.decodeFromStream(stream, videoRef.current!, (res) => {
        if (res) handleBarcode(res.getText());
      });
    } catch (e: any) {
      setCameraError(e?.message || 'Camera access denied');
      setScanning(false);
    }
  }, [handleBarcode]);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const handleDemo = () => {
    if (items.length === 0) return;
    handleBarcode(items[demoIdx % items.length].barcode);
    setDemoIdx(d => d + 1);
  };

  const handleManual = () => {
    const code = manualCode.trim();
    if (code) { handleBarcode(code); setManualCode(''); }
  };

  const openMaintenance = (item: ProcurementItem) => {
    setMaintenanceItem(item);
    setShowMaintenance(true);
  };

  const handleMaintenanceSubmit = (entry: MaintenanceEntry) => {
    onAddMaintenanceLog?.(entry);
  };

  const handleMaintenanceBack = () => {
    setShowMaintenance(false);
    setMaintenanceItem(null);
  };

  // ── Show maintenance log page ────────────────────────────────────────────
  if (showMaintenance && maintenanceItem) {
    return (
      <MaintenanceLog
        item={maintenanceItem}
        onBack={handleMaintenanceBack}
        onSubmit={handleMaintenanceSubmit}
      />
    );
  }

  // ── Main scanner UI ──────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ padding: '20px 20px 0', paddingBottom: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>Item Scanner</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>
          Scan PDF417 barcodes · tap <strong style={{ color: 'var(--primary)' }}>Edit</strong> to log maintenance
        </p>
      </div>

      {/* Camera viewport */}
      <div style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        marginBottom: 14, aspectRatio: '4/3',
      }}>
        <video
          ref={videoRef}
          autoPlay muted playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }}
        />

        {/* Idle */}
        {!scanning && !result && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 70, height: 70, borderRadius: 20, background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Scan size={30} color="#34d399" />
            </motion.div>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>Ready to scan PDF417</p>
          </div>
        )}

        {/* Scanning overlay — wide for PDF417 */}
        {scanning && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: '35%', left: '5%', right: '5%', bottom: '35%',
              border: '2px solid var(--primary)', borderRadius: 8,
              boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)',
            }}>
              {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
                <div key={`${v}${h}`} style={{
                  position: 'absolute', [v]: -2, [h]: -2, width: 18, height: 18,
                  borderTop:    v === 'top'    ? '3px solid var(--primary)' : 'none',
                  borderBottom: v === 'bottom' ? '3px solid var(--primary)' : 'none',
                  borderLeft:   h === 'left'   ? '3px solid var(--primary)' : 'none',
                  borderRight:  h === 'right'  ? '3px solid var(--primary)' : 'none',
                }} />
              ))}
              <motion.div
                animate={{ top: ['5%', '90%', '5%'] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg, transparent, var(--primary), var(--secondary), var(--primary), transparent)',
                  boxShadow: '0 0 8px var(--primary)',
                }}
              />
            </div>
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.6)', padding: '4px 14px', borderRadius: 20 }}>
                Hold PDF417 barcode inside the frame
              </span>
            </div>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 }}>
            <AlertCircle size={28} color="var(--warning)" />
            <p style={{ color: 'var(--warning)', fontSize: 12, textAlign: 'center', margin: 0 }}>
              Camera unavailable · Use Demo or Manual entry
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: 11, textAlign: 'center', margin: 0 }}>{cameraError}</p>
          </div>
        )}
      </div>

      {/* Scan controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {!scanning ? (
          <button onClick={startScanner} className="bright-button" style={{ flex: 2, background: 'linear-gradient(135deg, var(--secondary), #059669)', fontSize: 15, padding: '14px' }}>
            <Scan size={18} /> Start Scan
          </button>
        ) : (
          <button onClick={stopScanner} className="btn-ghost" style={{ flex: 2, color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', fontSize: 15, padding: '14px' }}>
            <X size={18} /> Stop
          </button>
        )}
        <button onClick={handleDemo} className="btn-ghost" style={{ flex: 1, color: 'var(--primary)', borderColor: 'rgba(212,175,55,0.3)', background: 'var(--primary-light)', fontSize: 13, padding: '14px' }}>
          <Zap size={15} /> Demo
        </button>
      </div>

      {/* Manual entry */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          className="input-field"
          placeholder="Type or paste barcode (e.g. UNIV-ITEQ-...)"
          value={manualCode}
          onChange={e => setManualCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleManual()}
          style={{ flex: 1, fontFamily: 'DM Mono, monospace', fontSize: 12 }}
        />
        <button onClick={handleManual} className="btn-ghost" style={{ whiteSpace: 'nowrap' }}>Lookup</button>
      </div>

      {/* Result Card Modal Overlay */}
      <AnimatePresence>
        {result && (
          <div style={{ position: 'fixed', inset: 0, zindex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ width: '100%', maxWidth: 450 }}
            >
              {result.item ? (
                <ItemResultCard
                  item={result.item}
                  barcode={result.barcode}
                  onReset={() => setResult(null)}
                  onEdit={() => openMaintenance(result.item!)}
                />
              ) : (
                <div className="bright-panel" style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>Asset Not Found</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: '0 0 20px', fontWeight: 600 }}>No item matched this barcode in our system.</p>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--danger)', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, marginBottom: 24 }}>{result.barcode}</div>
                  <button onClick={() => setResult(null)} className="bright-button" style={{ width: '100%' }}>Try Another Scan</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Item result card with Edit button ────────────────────────────────────────
function ItemResultCard({
  item, barcode, onReset, onEdit,
}: {
  item: ProcurementItem; barcode: string;
  onReset: () => void; onEdit: () => void;
}) {
  const color = categoryColors[item.category] || '#6366f1';

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
      {/* Color accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, #06b6d4)` }} />

      <div style={{ padding: 16 }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>{item.name}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${color}20`, color }}>
              {item.category}
            </span>
          </div>
          <button
            onClick={onReset}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}
          >
            <X size={13} color="var(--text-dim)" />
          </button>
        </div>

        {/* Barcode row */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Barcode</span>
          <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--primary)', fontWeight: 700 }}>{barcode}</span>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { icon: User,    label: 'Assigned To', value: item.assignedTo },
            { icon: MapPin,  label: 'Location',    value: item.location },
            { icon: Tag,     label: 'Category',    value: item.category },
            { icon: Package, label: 'Added',       value: item.createdAt },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Icon size={11} color="var(--text-dim)" />
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{label}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* IT Specific Details Popup */}
        {(item.category === 'IT Equipment' || item.category === 'Accessories') && (
          <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
               TECHNICAL SPECIFICATIONS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.device_spec && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Hardware</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{item.device_spec}</div>
                </div>
              )}
              {item.win_spec && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>OS Edition</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{item.win_spec}</div>
                </div>
              )}
              {item.processor && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>CPU</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{item.processor}</div>
                  </div>
                  {item.ram && (
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>RAM</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{item.ram}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Item photo */}
        {item.photoUrl && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>Item Photo</div>
            <img src={item.photoUrl} alt={item.name} style={{ width: '100%', borderRadius: 10, maxHeight: 150, objectFit: 'cover', border: '1px solid var(--border)' }} />
          </div>
        )}

        {/* Verified banner */}
        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-glow)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <CheckCircle size={16} color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Item verified successfully</span>
        </div>

        {/* ── EDIT / MAINTENANCE LOG BUTTON ── */}
        <button
          onClick={onEdit}
          className="bright-button"
          style={{
            width: '100%',
            fontSize: 15,
            padding: '14px',
            gap: 8,
          }}
        >
          <Wrench size={17} />
          Edit / Log Maintenance
        </button>
      </div>
    </div>
  );
}
