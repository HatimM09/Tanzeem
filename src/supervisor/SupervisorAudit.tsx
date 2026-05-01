import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, AlertTriangle, ArrowLeft, Search, CheckSquare, XSquare } from 'lucide-react';
import { ProcurementItem } from '../store/appStore';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface Props {
  items: ProcurementItem[];
}

function createReader() {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417, BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints, 300);
}

export default function SupervisorAudit({ items }: Props) {
  const [location, setLocation] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [targetItems, setTargetItems] = useState<ProcurementItem[]>([]);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [wrongItems, setWrongItems] = useState<ProcurementItem[]>([]);
  
  // Scanner state
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);

  const locations = Array.from(new Set(items.map(i => i.location).filter(Boolean)));

  const startAudit = (loc: string) => {
    setLocation(loc);
    setTargetItems(items.filter(i => i.location === loc));
    setFoundIds(new Set());
    setWrongItems([]);
    setIsAuditing(true);
  };

  const stopScanner = useCallback(() => {
    try { readerRef.current?.reset(); } catch {}
    readerRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  const handleBarcode = useCallback((code: string) => {
    const now = Date.now();
    if (now - lastScanTime < 1500) return; // debounce
    setLastScanTime(now);

    const foundInDB = items.find(i => i.barcode === code);
    if (!foundInDB) {
      alert(`Barcode ${code} not found in database!`);
      return;
    }

    if (foundInDB.location === location) {
      // It belongs here!
      setFoundIds(prev => new Set(prev).add(foundInDB.id));
      // Optionally play success beep
    } else {
      // Wrong room!
      setWrongItems(prev => {
        if (prev.find(p => p.id === foundInDB.id)) return prev;
        return [foundInDB, ...prev];
      });
      alert(`WRONG LOCATION! ${foundInDB.name} belongs in ${foundInDB.location}`);
    }
  }, [items, location, lastScanTime]);

  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
      alert('Camera error: ' + e.message);
      setScanning(false);
    }
  }, [handleBarcode]);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  if (!isAuditing) {
    return (
      <div className="fade-in" style={{ padding: '20px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>Blind Audit Mode</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>Select a location to begin auditing its inventory.</p>
        </div>
        
        <div className="bright-panel" style={{ padding: 20 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              className="input-field" 
              style={{ paddingLeft: 44 }} 
              placeholder="Search or type location..." 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
            {locations.filter(l => l.toLowerCase().includes(location.toLowerCase())).map(loc => {
              const count = items.filter(i => i.location === loc).length;
              return (
                <button 
                  key={loc} 
                  onClick={() => startAudit(loc)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', alignItems: 'center' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{loc}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 20 }}>{count} items</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const progress = targetItems.length === 0 ? 100 : Math.round((foundIds.size / targetItems.length) * 100);

  return (
    <div className="fade-in" style={{ padding: '20px', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => { setIsAuditing(false); stopScanner(); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>AUDITING LOCATION</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>{location}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="bright-panel" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Audit Progress</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{foundIds.size} / {targetItems.length} ({progress}%)</span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--bg-main)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Camera */}
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border)', aspectRatio: '4/3', marginBottom: 16 }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }} />
        {!scanning && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Scan size={30} color="var(--text-dim)" />
            <button onClick={startScanner} className="bright-button">Start Scanner</button>
          </div>
        )}
        {scanning && (
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'white', background: 'rgba(0,0,0,0.6)', padding: '6px 14px', borderRadius: 20 }}>Scanning for {targetItems.length - foundIds.size} remaining items...</span>
            <button onClick={stopScanner} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Stop</button>
          </div>
        )}
      </div>

      {/* Missing Items */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckSquare size={14} /> Expected Items ({targetItems.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {targetItems.map(item => {
            const found = foundIds.has(item.id);
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: found ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface)', border: `1px solid ${found ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`, borderRadius: 10 }}>
                {found ? <CheckCircle size={16} color="#10b981" /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-strong)' }} />}
                <div style={{ flex: 1, textDecoration: found ? 'line-through' : 'none', opacity: found ? 0.6 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'DM Mono, monospace' }}>{item.barcode}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wrong Items */}
      {wrongItems.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> Wrong Location ({wrongItems.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wrongItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                <XSquare size={16} color="#ef4444" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#ef4444' }}>Belongs in: {item.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
