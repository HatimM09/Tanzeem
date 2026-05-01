import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronDown, Camera, Upload, X,
  CheckCircle, Wrench, Plus, Trash2, AlertTriangle,
} from 'lucide-react';
import { ProcurementItem } from '../store/appStore';
import { maintenanceData, actionTypes, conditionOptions } from '../data/maintenanceOptions';

export interface MaintenanceEntry {
  id: string;
  itemId: string;
  itemName: string;
  itemBarcode: string;
  category: string;
  subcategory: string;
  components: string[];          // selected from dropdown
  customComponent: string;       // typed if "Other"
  actionType: string;
  condition: string;
  description: string;           // free-text notes
  photoUrl: string | null;
  loggedBy: string;
  loggedAt: string;
}

interface Props {
  item: ProcurementItem;
  onBack: () => void;
  onSubmit: (entry: MaintenanceEntry) => void;
}

function Select({
  label, value, options, onChange, placeholder,
}: {
  label: string; value: string;
  options: string[]; onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          className="input-field"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ appearance: 'none', paddingRight: 36 }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={15} color="var(--text-dim)"
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

export default function MaintenanceLog({ item, onBack, onSubmit }: Props) {
  const subcats = maintenanceData[item.category] || maintenanceData['Other'];

  const [subcategory, setSubcategory]       = useState(subcats[0]?.label || '');
  const [selectedComps, setSelectedComps]   = useState<string[]>([]);
  const [customComponent, setCustomComponent] = useState('');
  const [actionType, setActionType]         = useState(actionTypes[0]);
  const [condition, setCondition]           = useState(conditionOptions[0]);
  const [description, setDescription]       = useState('');
  const [photoUrl, setPhotoUrl]             = useState<string | null>(null);
  const [cameraOpen, setCameraOpen]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [compDropOpen, setCompDropOpen]     = useState(false);

  const fileRef  = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Current subcategory's component list
  const currentSubcat = subcats.find(s => s.label === subcategory) || subcats[0];
  const compOptions   = currentSubcat?.components || [];

  // When subcategory changes, clear selected components
  const handleSubcatChange = (v: string) => {
    setSubcategory(v);
    setSelectedComps([]);
    setCustomComponent('');
  };

  const toggleComponent = (comp: string) => {
    setSelectedComps(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  // Camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch { alert('Camera not available. Please use file upload.'); }
  };
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
    setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
    closeCamera();
  };
  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const hasOther = selectedComps.some(c => c === 'Other (specify below)');

  const handleSubmit = () => {
    const entry: MaintenanceEntry = {
      id:              Date.now().toString(),
      itemId:          item.id,
      itemName:        item.name,
      itemBarcode:     item.barcode,
      category:        item.category,
      subcategory,
      components:      selectedComps,
      customComponent: hasOther ? customComponent : '',
      actionType,
      condition,
      description,
      photoUrl,
      loggedBy:        'Supervisor',
      loggedAt:        new Date().toLocaleString(),
    };
    onSubmit(entry);
    setSubmitted(true);

    // Update item condition in Supabase
    import('../lib/api').then(({ api }) => {
      api.items.update(item.id, { condition }).catch(console.error);
    });
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80dvh', padding: 28, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--primary-light)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={36} color="var(--primary)" />
          </div>
        </motion.div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Log Saved!</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Maintenance record for <strong style={{ color: 'var(--text-main)' }}>{item.name}</strong> has been saved successfully.
        </p>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, width: '100%', marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Action Logged</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{actionType}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{subcategory} · {selectedComps.length} component(s)</div>
        </div>
        <button onClick={onBack} className="bright-button">← Back to Scanner</button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 100 }}>
      {/* Camera modal */}
      {cameraOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-main)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ flex: 1, objectFit: 'cover', width: '100%' }} />
          <div style={{ padding: 20, display: 'flex', gap: 12 }}>
            <button onClick={closeCamera} className="btn-ghost" style={{ flex: 1, padding: 14 }}>Cancel</button>
            <button onClick={capturePhoto} className="bright-button" style={{ flex: 2, background: 'linear-gradient(135deg, var(--primary), var(--primary-vivid))' }}>📸 Capture</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--glass-strong)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={18} color="var(--text-main)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, letterSpacing: 0.5 }}>MAINTENANCE LOG</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        </div>
        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-glow)', borderRadius: 10, padding: '4px 10px' }}>
          <Wrench size={14} color="var(--primary)" />
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>

        {/* ── Item info card (pre-filled, read-only) ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10, fontWeight: 700, letterSpacing: 0.5 }}>ITEM INFORMATION (PRE-FILLED)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Item Name',    item.name],
              ['Category',     item.category],
              ['Assigned To',  item.assignedTo],
              ['Location',     item.location],
              ['Barcode',      item.barcode],
              ['Added On',     item.createdAt],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Subcategory ── */}
        <div style={{ marginBottom: 16 }}>
          <Select
            label={`Subcategory (${item.category})`}
            value={subcategory}
            options={subcats.map(s => s.label)}
            onChange={handleSubcatChange}
          />
        </div>

        {/* ── Component multi-select dropdown ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
            Components / Parts Involved
            <span style={{ color: '#475569', fontWeight: 400, marginLeft: 4 }}>({selectedComps.length} selected)</span>
          </label>

          {/* Dropdown toggle */}
          <button
            onClick={() => setCompDropOpen(o => !o)}
            style={{
              width: '100%', background: 'var(--bg-surface)', border: `1px solid ${compDropOpen ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-main)', fontSize: 14,
              transition: 'border-color 0.2s',
            }}
          >
            <span style={{ color: selectedComps.length ? 'var(--text-main)' : 'var(--text-dim)' }}>
              {selectedComps.length ? `${selectedComps.length} item(s) selected` : 'Select components...'}
            </span>
            <ChevronDown size={15} color="var(--text-dim)" style={{ transform: compDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown list */}
          <AnimatePresence>
            {compDropOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--primary)', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}
              >
                {compOptions.map(comp => {
                  const isSelected = selectedComps.includes(comp);
                  const isOther    = comp === 'Other (specify below)';
                  return (
                    <button
                      key={comp}
                      onClick={() => toggleComponent(comp)}
                      style={{
                        width: '100%', padding: '11px 14px', background: 'none',
                        border: 'none', borderBottom: '1px solid #1e2d45',
                        display: 'flex', alignItems: 'center', gap: 10,
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-strong)'}`,
                        background: isSelected ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {isSelected && <span style={{ color: '#0c0e14', fontSize: 11, fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: isOther ? 'var(--primary)' : isSelected ? 'var(--text-main)' : 'var(--text-dim)', fontStyle: isOther ? 'italic' : 'normal' }}>
                        {comp}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected chips */}
          {selectedComps.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {selectedComps.map(comp => (
                <span key={comp} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--primary-light)', border: '1px solid var(--primary-glow)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'var(--primary-vivid)' }}>
                  {comp.length > 30 ? comp.slice(0, 30) + '…' : comp}
                  <button onClick={() => toggleComponent(comp)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <X size={10} color="var(--primary)" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── "Other" custom text field ── */}
        <AnimatePresence>
          {hasOther && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 16, overflow: 'hidden' }}
            >
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Specify "Other" Component / Part
              </label>
              <input
                className="input-field"
                placeholder="Describe the component or part..."
                value={customComponent}
                onChange={e => setCustomComponent(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action Type ── */}
        <div style={{ marginBottom: 16 }}>
          <Select
            label="Action Performed"
            value={actionType}
            options={actionTypes}
            onChange={setActionType}
          />
        </div>

        {/* ── Current Condition ── */}
        <div style={{ marginBottom: 16 }}>
          <Select
            label="Item Condition After Work"
            value={condition}
            options={conditionOptions}
            onChange={setCondition}
          />
        </div>

        {/* ── Condition color indicator ── */}
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 10,
          background: condition.includes('Good') ? 'rgba(52,211,153,0.08)' :
                      condition.includes('Minor') ? 'rgba(245,158,11,0.08)' :
                      condition.includes('Partially') ? 'rgba(249,115,22,0.08)' :
                      condition.includes('Not Working') ? 'rgba(239,68,68,0.08)' :
                      'rgba(239,68,68,0.12)',
          border: `1px solid ${
            condition.includes('Good') ? 'rgba(52,211,153,0.25)' :
            condition.includes('Minor') ? 'rgba(245,158,11,0.25)' :
            condition.includes('Partially') ? 'rgba(249,115,22,0.25)' :
            'rgba(239,68,68,0.25)'
          }`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: condition.includes('Good') ? '#34d399' :
                        condition.includes('Minor') ? '#f59e0b' :
                        condition.includes('Partially') ? '#f97316' : '#ef4444',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{condition}</span>
        </div>

        {/* ── Description / Notes ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
            Work Description / Notes
          </label>
          <textarea
            className="input-field"
            placeholder="Describe what was done, parts used, issues found..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            style={{ resize: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* ── Photo ── */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
            Attach Photo (optional)
          </label>
          {photoUrl ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e2d45' }}>
              <img src={photoUrl} alt="maintenance" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
              <button
                onClick={() => setPhotoUrl(null)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={13} color="white" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={openCamera} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: 12, padding: '18px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Camera size={22} color="var(--primary)" />
                <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'inherit' }}>Camera</span>
              </button>
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: 12, padding: '18px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Upload size={22} color="var(--secondary)" />
                <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'inherit' }}>Upload</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          )}
        </div>

        {/* ── Validation hint ── */}
        {selectedComps.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <AlertTriangle size={14} color="#f59e0b" />
            <span style={{ fontSize: 12, color: '#f59e0b' }}>Select at least one component to continue</span>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={selectedComps.length === 0}
          className="bright-button"
          style={{
            width: '100%',
            background: selectedComps.length === 0 ? 'var(--bg-surface)' : 'linear-gradient(135deg, var(--primary), var(--primary-vivid))',
            color: selectedComps.length === 0 ? 'var(--text-dim)' : '#0c0e14',
            fontSize: 15,
            padding: '15px',
            gap: 8,
          }}
        >
          <Wrench size={17} /> Save Maintenance Log
        </button>
      </div>
    </div>
  );
}
