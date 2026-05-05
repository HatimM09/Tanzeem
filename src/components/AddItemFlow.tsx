import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Cpu, HardDrive, Monitor, Keyboard, 
  MousePointer, Headphones, Speaker, Video, CheckCircle, 
  ArrowRight, ArrowLeft, QrCode, FileText, Smartphone, Laptop
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface Props {
  onAdd: (item: any) => void;
  onBulkAdd?: (items: any[]) => void;
  onDone: () => void;
  categories?: string[];
}

export default function AddItemFlow({ onAdd, onBulkAdd, onDone }: Props) {
  const [step, setStep] = useState(1);

  React.useEffect(() => {
    if (step === 6) {
      generatePDF();
    }
  }, [step]);
  
  const [formData, setFormData] = useState({
    // General
    assignName: '',
    officeName: '',
    deskName: '',
    
    // Device Specs
    processorBrand: '', processorSize: '', processorSerial: '',
    ramBrand: '', ramSize: '', ramSerial: '',
    gpuBrand: '', gpuSize: '', gpuSerial: '',
    smpsBrand: '', smpsSerial: '',
    deviceId: '', productId: '', systemType: '', penAndTouch: '',
    
    // Windows Specs
    winEdition: '', winVersion: '', winInstalledOn: '', winOsBuild: '', winExperience: '',
    
    // Accessories
    monitorBrand: '', monitorSerial: '',
    keyboardBrand: '', keyboardSerial: '',
    mouseBrand: '', mouseSerial: '',
    headphonesBrand: '', headphonesSerial: '',
    webcamBrand: '', webcamSerial: '',
    speakersBrand: '', speakersSerial: '',
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // 1. Save Main PC Workstation
      const pcId = formData.deviceId || `PC-${Math.floor(1000 + Math.random() * 9000)}`;
      const pcItem = {
        id: Date.now().toString(),
        name: `PC: ${formData.processorBrand || 'Unknown'} - ${formData.winEdition || 'Windows'}`,
        assignedTo: formData.assignName,
        location: `${formData.officeName} - ${formData.deskName}`,
        category: 'IT Equipment',
        barcode: pcId,
        stock: 1,
        reorderLevel: 0,
        unitPrice: 0,
        photoUrl: null,
        condition: 'New',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin',
        processor: formData.processorBrand,
        ram: formData.ramBrand,
        // Custom field for Windows spec
        win_spec: `${formData.winEdition} ${formData.winVersion}`,
        device_spec: `${formData.processorBrand} ${formData.processorSize} / ${formData.ramBrand} ${formData.ramSize}`
      };
      
      // 3. Combine for Bulk Add
      const allItemsToSave = [pcItem];
      
      const accessories = [
        { name: 'Monitor', brand: 'monitorBrand', serial: 'monitorSerial' },
        { name: 'Keyboard', brand: 'keyboardBrand', serial: 'keyboardSerial' },
        { name: 'Mouse', brand: 'mouseBrand', serial: 'mouseSerial' },
        { name: 'Headphones', brand: 'headphonesBrand', serial: 'headphonesSerial' },
        { name: 'Speakers', brand: 'speakersBrand', serial: 'speakersSerial' },
        { name: 'Webcam', brand: 'webcamBrand', serial: 'webcamSerial' }
      ];

      accessories.forEach(acc => {
        const brand = (formData as any)[acc.brand];
        const serial = (formData as any)[acc.serial];
        if (serial && serial.trim() !== '') {
          allItemsToSave.push({
            id: `${Date.now()}-${acc.name}`,
            name: `${acc.name} - ${brand}`,
            assignedTo: formData.assignName,
            location: `${formData.officeName} - ${formData.deskName}`,
            category: 'Accessories',
            barcode: serial,
            stock: 1,
            reorderLevel: 0,
            unitPrice: 0,
            photoUrl: null,
            condition: 'New',
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: 'Admin'
          });
        }
      });

      if (onBulkAdd) {
        await onBulkAdd(allItemsToSave);
      } else {
        // Fallback to individual adds if bulk not available
        for (const item of allItemsToSave) {
          await onAdd(item);
        }
      }

      setStep(6); // Success / Generation Step
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const generatePDF = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Helper to generate barcode base64
    const getBarcode = (text: string) => {
      if (!text) return null;
      const canvas = document.createElement('canvas');
      try {
        JsBarcode(canvas, text, { format: "CODE128", width: 2, height: 40, displayValue: true });
        return canvas.toDataURL();
      } catch(e) {
        return null;
      }
    };

    // Main PC ID (combining some identifying info or using a random ID if none)
    const pcId = formData.deviceId || `PC-${Math.floor(Math.random()*10000)}`;
    const pcBarcode = getBarcode(pcId);
    
    // Asset Barcodes (Internal Components + Peripherals)
    const allAssetBarcodes = [
      { name: 'Processor', brand: formData.processorBrand, serial: formData.processorSerial },
      { name: 'RAM', brand: formData.ramBrand, serial: formData.ramSerial },
      { name: 'Graphics', brand: formData.gpuBrand, serial: formData.gpuSerial },
      { name: 'SMPS', brand: formData.smpsBrand, serial: formData.smpsSerial },
      { name: 'Monitor', brand: formData.monitorBrand, serial: formData.monitorSerial },
      { name: 'Keyboard', brand: formData.keyboardBrand, serial: formData.keyboardSerial },
      { name: 'Mouse', brand: formData.mouseBrand, serial: formData.mouseSerial },
      { name: 'Headphones', brand: formData.headphonesBrand, serial: formData.headphonesSerial },
      { name: 'Speakers', brand: formData.speakersBrand, serial: formData.speakersSerial },
      { name: 'Webcam', brand: formData.webcamBrand, serial: formData.webcamSerial }
    ].filter(a => a.serial && a.serial.trim() !== '');

    // Prepare QR Code Data (Full Desk Information)
    const qrDataObj = {
      Desk_Report: {
        Assigned_To: formData.assignName,
        Location: `${formData.officeName} / ${formData.deskName}`,
        Workstation: {
          ID: pcId,
          Processor: `${formData.processorBrand} (${formData.processorSize})`,
          RAM: `${formData.ramBrand} (${formData.ramSize})`,
          GPU: `${formData.gpuBrand} (${formData.gpuSize})`,
          SMPS: `${formData.smpsBrand}`,
          OS: `${formData.winEdition} v${formData.winVersion}`,
          OS_Build: formData.winOsBuild
        },
        Accessories: allAssetBarcodes.map(a => ({
          Item: a.name,
          Brand: a.brand,
          Serial: a.serial
        }))
      }
    };
    const qrCodeData = await QRCode.toDataURL(JSON.stringify(qrDataObj, null, 2));

    printWindow.document.write(`
      <html>
        <head>
          <title>Inventory Labels - ${formData.assignName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #111; background: #fff; }
            .page { max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 4px solid #111; padding-bottom: 10px; margin-bottom: 20px; }
            .title { font-size: 28px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px; }
            
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .label-card { border: 2px solid #111; padding: 15px; border-radius: 8px; position: relative; }
            .label-title { font-size: 14px; font-weight: 900; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            .barcode-img { width: 100%; height: 50px; object-fit: contain; margin: 10px 0; }
            .label-meta { font-size: 10px; font-weight: 700; color: #444; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

            .desk-qr-container { 
              margin-top: 30px; 
              border: 3px solid #111; 
              border-radius: 12px; 
              padding: 20px; 
              display: flex; 
              gap: 30px; 
              align-items: center; 
              background: #fdfdfd;
            }
            .qr-box { flex-shrink: 0; text-align: center; border-right: 2px dashed #ccc; padding-right: 30px; }
            .qr-box img { width: 180px; height: 180px; }
            .qr-label { font-size: 12px; font-weight: 900; margin-top: 10px; color: #111; }
            
            .info-box { flex: 1; }
            .info-box h2 { margin: 0 0 15px 0; font-size: 18px; font-weight: 900; }
            .info-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-tag { background: #f0f0f0; padding: 8px; border-radius: 4px; }
            .info-tag-label { font-size: 9px; color: #888; font-weight: 800; text-transform: uppercase; }
            .info-tag-value { font-size: 12px; font-weight: 700; color: #111; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <h1 class="title">IT Asset Labels</h1>
              <div style="font-size: 12px; font-weight: 700;">Desk: ${formData.deskName} | User: ${formData.assignName}</div>
            </div>

            <div class="grid">
              <!-- Combined PC & Windows Label -->
              <div class="label-card" style="grid-column: span 2; background: #f9f9f9;">
                <div class="label-title">MAIN WORKSTATION (HW SPEC + WINDOWS)</div>
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="flex: 1;">
                    ${pcBarcode ? `<img class="barcode-img" src="${pcBarcode}" />` : '<div style="color:red">No Device ID</div>'}
                    <div style="text-align: center; font-size: 12px; font-weight: 900;">${pcId}</div>
                  </div>
                  <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 20px;">
                    <div class="label-meta">CPU: ${formData.processorBrand}</div>
                    <div class="label-meta">RAM: ${formData.ramBrand} ${formData.ramSize}</div>
                    <div class="label-meta">OS: ${formData.winEdition}</div>
                    <div class="label-meta">Ver: ${formData.winVersion} | Build: ${formData.winOsBuild}</div>
                  </div>
                </div>
              </div>

              <!-- Individual Asset Labels -->
              ${allAssetBarcodes.map(acc => {
                const b64 = getBarcode(acc.serial);
                return `
                <div class="label-card">
                  <div class="label-title">${acc.name.toUpperCase()}</div>
                  ${b64 ? `<img class="barcode-img" src="${b64}" />` : `<div style="padding:10px; border:1px dashed #ccc; font-size:10px; text-align:center; margin:10px 0;">[Barcode Generation Error]</div>`}
                  <div style="text-align: center; font-size: 10px; font-weight: 900; margin-bottom: 8px;">${acc.serial}</div>
                  <div class="label-meta">Brand: ${acc.brand}</div>
                </div>
              `}).join('')}
            </div>

            <!-- Full Desk QR Information -->
            <div class="desk-qr-container">
              <div class="qr-box">
                <img src="${qrCodeData}" />
                <div class="qr-label">FULL DESK QR CODE</div>
              </div>
              <div class="info-box">
                <h2>Desk Assignment Summary</h2>
                <div class="info-list">
                  <div class="info-tag"><div class="info-tag-label">User</div><div class="info-tag-value">${formData.assignName}</div></div>
                  <div class="info-tag"><div class="info-tag-label">Location</div><div class="info-tag-value">${formData.officeName} - ${formData.deskName}</div></div>
                  <div class="info-tag"><div class="info-tag-label">Workstation</div><div class="info-tag-value">${formData.processorBrand} / ${formData.ramSize}</div></div>
                  <div class="info-tag"><div class="info-tag-label">Linked Assets</div><div class="info-tag-value">${allAssetBarcodes.length} Barcodes</div></div>
                </div>
                <p style="font-size: 10px; color: #888; margin-top: 15px;">Scanning this QR provides complete hardware and software specifications for this desk.</p>
              </div>
            </div>

          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                // window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="step-title">Step 1: Assignment Information</h3>
            <p className="step-desc">Who and where is this equipment being assigned?</p>
            <div className="form-grid">
              <div style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Assign Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} className="input-icon" />
                  <input className="input-field icon-padding" placeholder="Person's Name" value={formData.assignName} onChange={e => updateForm('assignName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="input-label">Office Name / Number</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} className="input-icon" />
                  <input className="input-field icon-padding" placeholder="e.g. IT Dept / 302" value={formData.officeName} onChange={e => updateForm('officeName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="input-label">Desk Name / Number</label>
                <div style={{ position: 'relative' }}>
                  <Monitor size={16} className="input-icon" />
                  <input className="input-field icon-padding" placeholder="e.g. Desk A4" value={formData.deskName} onChange={e => updateForm('deskName', e.target.value)} />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="step-title">Step 2: Device Specifications</h3>
            <p className="step-desc">Enter the core hardware details of the machine.</p>
            
            <div className="spec-group">
              <h4 className="spec-heading"><Cpu size={14}/> Processor</h4>
              <div className="form-grid-3">
                <div><label className="input-label">Brand</label><input className="input-field" placeholder="e.g. Intel Core i7" value={formData.processorBrand} onChange={e => updateForm('processorBrand', e.target.value)} /></div>
                <div><label className="input-label">Size/Speed</label><input className="input-field" placeholder="e.g. 2.8GHz" value={formData.processorSize} onChange={e => updateForm('processorSize', e.target.value)} /></div>
                <div><label className="input-label">Serial Number</label><input className="input-field" placeholder="Processor SN" value={formData.processorSerial} onChange={e => updateForm('processorSerial', e.target.value)} /></div>
              </div>
            </div>

            <div className="spec-group">
              <h4 className="spec-heading"><HardDrive size={14}/> Installed RAM</h4>
              <div className="form-grid-3">
                <div><label className="input-label">Brand</label><input className="input-field" placeholder="e.g. Corsair" value={formData.ramBrand} onChange={e => updateForm('ramBrand', e.target.value)} /></div>
                <div><label className="input-label">Size</label><input className="input-field" placeholder="e.g. 16GB" value={formData.ramSize} onChange={e => updateForm('ramSize', e.target.value)} /></div>
                <div><label className="input-label">Serial Number</label><input className="input-field" placeholder="RAM SN" value={formData.ramSerial} onChange={e => updateForm('ramSerial', e.target.value)} /></div>
              </div>
            </div>

            <div className="spec-group">
              <h4 className="spec-heading"><Monitor size={14}/> Graphic Card</h4>
              <div className="form-grid-3">
                <div><label className="input-label">Brand</label><input className="input-field" placeholder="e.g. NVIDIA RTX 3060" value={formData.gpuBrand} onChange={e => updateForm('gpuBrand', e.target.value)} /></div>
                <div><label className="input-label">Size</label><input className="input-field" placeholder="e.g. 12GB" value={formData.gpuSize} onChange={e => updateForm('gpuSize', e.target.value)} /></div>
                <div><label className="input-label">Serial Number</label><input className="input-field" placeholder="GPU SN" value={formData.gpuSerial} onChange={e => updateForm('gpuSerial', e.target.value)} /></div>
              </div>
            </div>

            <div className="spec-group">
              <h4 className="spec-heading"><HardDrive size={14}/> SMPS (Power Supply)</h4>
              <div className="form-grid-2">
                <div><label className="input-label">Brand</label><input className="input-field" placeholder="e.g. Corsair 750W" value={formData.smpsBrand} onChange={e => updateForm('smpsBrand', e.target.value)} /></div>
                <div><label className="input-label">Serial Number</label><input className="input-field" placeholder="SMPS SN" value={formData.smpsSerial} onChange={e => updateForm('smpsSerial', e.target.value)} /></div>
              </div>
            </div>

            <div className="spec-group" style={{ marginTop: 24 }}>
              <h4 className="spec-heading"><Laptop size={14}/> System Details</h4>
              <div className="form-grid-2">
                <div><label className="input-label">Device ID</label><input className="input-field" placeholder="Device ID" value={formData.deviceId} onChange={e => updateForm('deviceId', e.target.value)} /></div>
                <div><label className="input-label">Product ID</label><input className="input-field" placeholder="Product ID" value={formData.productId} onChange={e => updateForm('productId', e.target.value)} /></div>
                <div><label className="input-label">System Type</label><input className="input-field" placeholder="64-bit OS, x64-based" value={formData.systemType} onChange={e => updateForm('systemType', e.target.value)} /></div>
                <div><label className="input-label">Pen and Touch</label><input className="input-field" placeholder="No pen or touch input" value={formData.penAndTouch} onChange={e => updateForm('penAndTouch', e.target.value)} /></div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="step-title">Step 3: Windows Specifications</h3>
            <p className="step-desc">Operating system details.</p>
            <div className="form-grid-2">
              <div><label className="input-label">Edition</label><input className="input-field" placeholder="e.g. Windows 11 Pro" value={formData.winEdition} onChange={e => updateForm('winEdition', e.target.value)} /></div>
              <div><label className="input-label">Version</label><input className="input-field" placeholder="e.g. 22H2" value={formData.winVersion} onChange={e => updateForm('winVersion', e.target.value)} /></div>
              <div><label className="input-label">Installed On</label><input className="input-field" type="date" value={formData.winInstalledOn} onChange={e => updateForm('winInstalledOn', e.target.value)} /></div>
              <div><label className="input-label">OS Build</label><input className="input-field" placeholder="e.g. 22621.1702" value={formData.winOsBuild} onChange={e => updateForm('winOsBuild', e.target.value)} /></div>
              <div style={{ gridColumn: 'span 2' }}><label className="input-label">Experience</label><input className="input-field" placeholder="Windows Feature Experience Pack..." value={formData.winExperience} onChange={e => updateForm('winExperience', e.target.value)} /></div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="step-title">Step 4: Accessories</h3>
            <p className="step-desc">Peripherals attached to this workstation.</p>
            
            <div className="acc-list">
              {[
                { label: 'Monitor', icon: <Monitor size={16}/>, bField: 'monitorBrand', sField: 'monitorSerial' },
                { label: 'Keyboard', icon: <Keyboard size={16}/>, bField: 'keyboardBrand', sField: 'keyboardSerial' },
                { label: 'Mouse', icon: <MousePointer size={16}/>, bField: 'mouseBrand', sField: 'mouseSerial' },
                { label: 'Headphones', icon: <Headphones size={16}/>, bField: 'headphonesBrand', sField: 'headphonesSerial' },
                { label: 'Webcam', icon: <Video size={16}/>, bField: 'webcamBrand', sField: 'webcamSerial' },
                { label: 'Speakers', icon: <Speaker size={16}/>, bField: 'speakersBrand', sField: 'speakersSerial' },
              ].map((acc, idx) => (
                <div key={idx} className="acc-row">
                  <div className="acc-label">{acc.icon} {acc.label}</div>
                  <div className="acc-inputs">
                    <input className="input-field" placeholder="Brand Name" value={(formData as any)[acc.bField]} onChange={e => updateForm(acc.bField, e.target.value)} />
                    <input className="input-field" placeholder="Serial Number" value={(formData as any)[acc.sField]} onChange={e => updateForm(acc.sField, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="step-title">Step 5: Review & Save</h3>
            <p className="step-desc">Ensure all serial numbers and specifications are correct.</p>
            
            <div className="review-box">
              <div className="review-section">
                <h5>Assignment</h5>
                <p><strong>{formData.assignName || 'N/A'}</strong> at <strong>{formData.officeName || 'N/A'}</strong> (Desk: {formData.deskName || 'N/A'})</p>
              </div>
              <div className="review-section">
                <h5>Device ID & Specs</h5>
                <p>Device ID: {formData.deviceId || 'N/A'}</p>
                <p>CPU: {formData.processorBrand} {formData.processorSize}</p>
                <p>RAM: {formData.ramBrand} {formData.ramSize}</p>
                <p>OS: {formData.winEdition} {formData.winVersion}</p>
              </div>
              <div className="review-section" style={{ borderBottom: 'none' }}>
                <h5>Accessories Linked</h5>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {formData.monitorSerial && <span className="chip">Monitor</span>}
                  {formData.keyboardSerial && <span className="chip">Keyboard</span>}
                  {formData.mouseSerial && <span className="chip">Mouse</span>}
                  {formData.headphonesSerial && <span className="chip">Headphones</span>}
                  {formData.webcamSerial && <span className="chip">Webcam</span>}
                  {formData.speakersSerial && <span className="chip">Speakers</span>}
                  {!formData.monitorSerial && !formData.keyboardSerial && !formData.mouseSerial && !formData.headphonesSerial && !formData.webcamSerial && !formData.speakersSerial && <span style={{fontSize: 12, color: 'var(--text-dim)'}}>No accessories with serials added.</span>}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="success-icon">
              <CheckCircle size={48} color="#34d399" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>IT Equipment Configured</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: 32 }}>All specifications and accessories have been recorded.</p>
            
            <div className="success-actions">
              <button onClick={generatePDF} className="bright-button" style={{ padding: '16px 20px', fontSize: 16 }}>
                <QrCode size={20} /> Generate Labels & Desk QR
              </button>
              <button onClick={() => {
                // Reset everything to add another
                setFormData({
                  assignName: '', officeName: '', deskName: '',
                  processorBrand: '', processorSize: '', processorSerial: '',
                  ramBrand: '', ramSize: '', ramSerial: '',
                  gpuBrand: '', gpuSize: '', gpuSerial: '',
                  smpsBrand: '', smpsSerial: '',
                  deviceId: '', productId: '', systemType: '', penAndTouch: '',
                  winEdition: '', winVersion: '', winInstalledOn: '', winOsBuild: '', winExperience: '',
                  monitorBrand: '', monitorSerial: '', keyboardBrand: '', keyboardSerial: '',
                  mouseBrand: '', mouseSerial: '', headphonesBrand: '', headphonesSerial: '',
                  webcamBrand: '', webcamSerial: '', speakersBrand: '', speakersSerial: '',
                });
                setStep(1);
              }} className="btn-ghost" style={{ marginTop: 12 }}>
                Add Another Workstation
              </button>
              <button onClick={onDone} className="btn-ghost">
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="add-it-flow-container">
      {step <= 5 && (
        <div className="stepper-header">
          <div className="stepper-progress">
            { [1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`step-dot ${step === s ? 'active' : step > s ? 'completed' : ''}`}>
                {step > s ? <CheckCircle size={14} /> : s}
              </div>
            ))}
          </div>
          <div className="stepper-labels">
            <span>Assign</span>
            <span>Device</span>
            <span>Windows</span>
            <span>Accessory</span>
            <span>Review</span>
          </div>
        </div>
      )}

      <div className="step-content-area" style={{ minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {step <= 5 && (
        <div className="step-footer">
          <button 
            onClick={handleBack} 
            className="btn-ghost" 
            disabled={step === 1}
            style={{ opacity: step === 1 ? 0.3 : 1 }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button 
            onClick={handleNext} 
            className="bright-button"
            disabled={step === 1 && !formData.assignName}
          >
            {step === 5 ? 'Confirm Details' : 'Continue'} <ArrowRight size={18} />
          </button>
        </div>
      )}

      <style>{`
        .add-it-flow-container {
          max-width: 750px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        /* Stepper */
        .stepper-header { margin-bottom: 40px; }
        .stepper-progress {
          display: flex; justify-content: space-between; position: relative; margin-bottom: 12px;
        }
        .stepper-progress::before {
          content: ''; position: absolute; top: 50%; left: 0; right: 0;
          height: 2px; background: rgba(255,255,255,0.1); z-index: 0; transform: translateY(-50%);
        }
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%; background: var(--bg-surface);
          border: 2px solid var(--border); display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; z-index: 1; transition: all 0.3s; color: var(--text-dim);
        }
        .step-dot.active { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 0 15px rgba(212,175,55,0.4); }
        .step-dot.completed { background: #34d399; border-color: #34d399; color: white; }
        .stepper-labels { display: flex; justify-content: space-between; padding: 0 4px; }
        .stepper-labels span { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; width: 40px; text-align: center; }
        
        /* Typography */
        .step-title { font-size: 22px; font-weight: 900; margin: 0 0 8px; color: var(--text-main); }
        .step-desc { font-size: 14px; color: var(--text-dim); margin-bottom: 32px; }
        
        /* Forms */
        .input-label { font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; display: block; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-dim); }
        .icon-padding { padding-left: 42px !important; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        
        /* Specs Section */
        .spec-group { background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .spec-heading { font-size: 13px; font-weight: 800; color: var(--primary); text-transform: uppercase; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
        
        /* Accessories Section */
        .acc-list { display: flex; flex-direction: column; gap: 12px; }
        .acc-row { display: grid; grid-template-columns: 140px 1fr; align-items: center; background: rgba(0,0,0,0.1); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border); }
        .acc-label { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--text-main); }
        .acc-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* Review Section */
        .review-box { background: rgba(0,0,0,0.15); border-radius: 16px; border: 1px solid var(--border-strong); overflow: hidden; }
        .review-section { padding: 20px; border-bottom: 1px solid var(--border); }
        .review-section h5 { margin: 0 0 12px 0; font-size: 12px; font-weight: 800; color: var(--primary); text-transform: uppercase; }
        .review-section p { margin: 0 0 6px 0; font-size: 13px; color: var(--text-main); }
        
        /* Success & Footer */
        .success-icon { width: 80px; height: 80px; background: rgba(52,211,153,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .success-actions { display: flex; flex-direction: column; gap: 12px; max-width: 350px; margin: 0 auto; }
        .step-footer { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
}
