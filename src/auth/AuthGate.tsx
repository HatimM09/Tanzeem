import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, HardHat, BookOpen, Mail, Phone,
  ArrowLeft, RefreshCw, CheckCircle, Lock,
  Eye, EyeOff, AlertTriangle, Clock, Edit2,
} from 'lucide-react';
import {
  Portal, PortalUser,
  getSavedUser, saveUser,
  generateOTP, maskEmail, maskPhone,
  OTP_EXPIRY_MS,
} from './authStore';

type Step = 'select-portal' | 'contact' | 'otp';

interface Props {
  serverOnline: boolean | null;
  onAuthenticated: (portal: Portal) => void;
}

const RESEND_WAIT  = 30;   // seconds before resend allowed

export default function AuthGate({ serverOnline, onAuthenticated }: Props) {

  // ── Navigation ───────────────────────────────────────────────────────────
  const [step,   setStep]   = useState<Step>('select-portal');
  const [portal, setPortal] = useState<Portal | null>(null);

  // ── Contact ───────────────────────────────────────────────────────────────
  const [user,        setUser]        = useState<PortalUser>({ name: '', email: '', phone: '' });
  const [editContact, setEditContact] = useState(false);

  // ── OTP session (never stored — memory only) ──────────────────────────────
  const [otpCode,    setOtpCode]    = useState('');
  const [otpExpiry,  setOtpExpiry]  = useState(0);
  const [channel,    setChannel]    = useState<'email' | 'sms'>('email');

  // ── OTP entry ─────────────────────────────────────────────────────────────
  const [digits,    setDigits]    = useState(['', '', '', '', '', '']);
  const [error,     setError]     = useState<string | null>(null);
  const [showCode,  setShowCode]  = useState(false);
  const [verified,  setVerified]  = useState(false);
  const [attempts,  setAttempts]  = useState(0);

  // ── Timers ────────────────────────────────────────────────────────────────
  const [countdown,   setCountdown]   = useState(0);
  const [resendWait,  setResendWait]  = useState(0);
  const countRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const resendRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Select portal ─────────────────────────────────────────────────────────
  const handleSelectPortal = (p: Portal) => {
    setPortal(p);
    const saved = getSavedUser(p);
    if (saved) {
      setUser(saved);
      setEditContact(false);
    } else {
      setUser({ name: '', email: '', phone: '' });
      setEditContact(true);
    }
    setStep('contact');
  };

  // ── Issue a fresh OTP every single send ───────────────────────────────────
  const issueOTP = (ch: 'email' | 'sms') => {
    // Always save latest contact
    if (user.name && user.email && user.phone) saveUser(portal!, user);

    const code   = generateOTP();
    const expiry = Date.now() + OTP_EXPIRY_MS;

    setOtpCode(code);
    setOtpExpiry(expiry);
    setChannel(ch);
    setDigits(['', '', '', '', '', '']);
    setError(null);
    setShowCode(false);
    setAttempts(0);
    setVerified(false);
    setCountdown(OTP_EXPIRY_MS / 1000);
    setResendWait(RESEND_WAIT);
    setStep('otp');
    setTimeout(() => inputRefs.current[0]?.focus(), 120);
  };

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'otp' || !otpCode) return;
    clearInterval(countRef.current!);
    setCountdown(Math.floor((otpExpiry - Date.now()) / 1000));
    countRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countRef.current!);
  }, [otpCode, step]);

  // ── Resend cooldown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (resendWait <= 0) return;
    clearInterval(resendRef.current!);
    resendRef.current = setInterval(() => {
      setResendWait(prev => {
        if (prev <= 1) { clearInterval(resendRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(resendRef.current!);
  }, [resendWait]);

  // ── OTP digit input ───────────────────────────────────────────────────────
  const handleDigit = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    setError(null);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) setTimeout(() => verify(next.join('')), 80);
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      setTimeout(() => verify(pasted), 80);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verify = (entered?: string) => {
    const code = entered ?? digits.join('');
    if (code.length < 6) return;
    if (Date.now() > otpExpiry)  { setError('Code expired. Request a new one.'); return; }
    if (attempts >= 4)           { setError('Too many attempts. Request a new code.'); return; }

    if (code === otpCode) {
      setVerified(true);
      // Clear OTP from memory immediately after success
      setOtpCode('');
      setTimeout(() => onAuthenticated(portal!), 1200);
    } else {
      const left = 3 - attempts;
      setAttempts(a => a + 1);
      setError(left > 0 ? `Wrong code — ${left} attempt${left !== 1 ? 's' : ''} left` : 'Too many attempts. Request a new code.');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 60);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt     = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const expired = countdown <= 0;
  const canSend = user.name.trim() && user.email.trim() && user.phone.trim();
  const filled  = digits.every(d => d !== '');

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="mobile-frame">
        <div className="fade-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px' }}>

          {/* ── Logo ── */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            <div style={{ width: 76, height: 76, borderRadius: 22, margin: '0 auto 12px', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
              <BookOpen size={38} color="white" />
            </div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: '#f1f5f9', margin: '0 0 3px' }}>Procurement Tracker</h1>
            <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 600, margin: '2px 0 1px' }}>Mahad al Zahra, Galiakot</p>
            <p style={{ color: '#475569', fontSize: 10, margin: 0 }}>From: Tanzeem Department</p>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════
                STEP 1 — Select Portal
            ══════════════════════════════════════════ */}
            {step === 'select-portal' && (
              <motion.div key="s1"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                style={{ width: '100%' }}
              >
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 18 }}>
                  Select your portal to continue
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {/* Admin */}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleSelectPortal('admin')}
                    style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 18, padding: '20px 22px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={22} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Admin Portal</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Add items · Generate barcodes · View complaints</div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Supervisor */}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleSelectPortal('supervisor')}
                    style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 18, padding: '20px 22px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HardHat size={22} color="#06b6d4" />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Supervisor Portal</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Scan items · View history · Resolve complaints</div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: serverOnline === null ? '#f59e0b' : serverOnline ? '#10b981' : '#ef4444' }} />
                  <span style={{ color: '#475569', fontSize: 10 }}>
                    {serverOnline === null ? 'Connecting...' : serverOnline ? 'Server online' : 'Offline mode'}
                  </span>
                </div>
                <p style={{ color: '#1e2d45', fontSize: 10, textAlign: 'center', margin: 0 }}>
                  © Mahad al Zahra · Al Jamea Tus Saifiyah, Galiakot
                </p>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════
                STEP 2 — Contact Info
            ══════════════════════════════════════════ */}
            {step === 'contact' && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
                style={{ width: '100%' }}
              >
                <button onClick={() => setStep('select-portal')}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, padding: 0 }}>
                  <ArrowLeft size={14} /> Back
                </button>

                {/* Portal badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: portal === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {portal === 'admin' ? <ShieldCheck size={18} color="#818cf8" /> : <HardHat size={18} color="#06b6d4" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{portal === 'admin' ? 'Admin Portal' : 'Supervisor Portal'}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>Verify identity to access</div>
                  </div>
                </div>

                {/* Contact card */}
                <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: 0.5 }}>YOUR CONTACT</span>
                    {!editContact && (
                      <button onClick={() => setEditContact(true)}
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '4px 10px', color: '#818cf8', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Edit2 size={10} /> Edit
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Name */}
                    <div>
                      <label style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 5 }}>Full Name</label>
                      {editContact
                        ? <input className="input-field" placeholder="e.g. Ahmed Khan" value={user.name} onChange={e => setUser(u => ({ ...u, name: e.target.value }))} />
                        : <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', padding: '6px 0' }}>{user.name}</div>
                      }
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                        <Mail size={10} /> Email Address
                      </label>
                      {editContact
                        ? <input className="input-field" type="email" placeholder="you@example.com" value={user.email} onChange={e => setUser(u => ({ ...u, email: e.target.value }))} />
                        : <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'DM Mono, monospace', padding: '5px 0' }}>{maskEmail(user.email)}</div>
                      }
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                        <Phone size={10} /> Phone / WhatsApp
                      </label>
                      {editContact
                        ? <input className="input-field" type="tel" placeholder="+92 300 1234567" value={user.phone} onChange={e => setUser(u => ({ ...u, phone: e.target.value }))} />
                        : <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'DM Mono, monospace', padding: '5px 0' }}>{maskPhone(user.phone)}</div>
                      }
                    </div>
                  </div>

                  {editContact && (
                    <button
                      onClick={() => { if (canSend) { saveUser(portal!, user); setEditContact(false); } }}
                      disabled={!canSend}
                      style={{ marginTop: 14, width: '100%', background: canSend ? 'rgba(16,185,129,0.12)' : '#1a2235', border: `1px solid ${canSend ? 'rgba(16,185,129,0.3)' : '#1e2d45'}`, borderRadius: 10, padding: '10px', color: canSend ? '#10b981' : '#475569', fontSize: 13, fontWeight: 700, cursor: canSend ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <CheckCircle size={14} /> Save Contact
                    </button>
                  )}
                </div>

                {/* Send code buttons */}
                {!editContact && (
                  <>
                    <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Send one-time code via:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => issueOTP('email')}
                        style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 14, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Mail size={18} color="#818cf8" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Send via Email</div>
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 1, fontFamily: 'DM Mono, monospace' }}>{maskEmail(user.email)}</div>
                        </div>
                        <span style={{ fontSize: 11, color: '#475569' }}>→</span>
                      </motion.button>

                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => issueOTP('sms')}
                        style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 14, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Phone size={18} color="#06b6d4" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Send via SMS / WhatsApp</div>
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 1, fontFamily: 'DM Mono, monospace' }}>{maskPhone(user.phone)}</div>
                        </div>
                        <span style={{ fontSize: 11, color: '#475569' }}>→</span>
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════
                STEP 3 — Enter OTP
            ══════════════════════════════════════════ */}
            {step === 'otp' && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
                style={{ width: '100%' }}
              >
                {/* Back */}
                <button onClick={() => { setStep('contact'); setDigits(['','','','','','']); setError(null); }}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, padding: 0 }}>
                  <ArrowLeft size={14} /> Change method
                </button>

                {/* Success */}
                {verified ? (
                  <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 0' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={34} color="#10b981" />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>Verified!</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Opening {portal === 'admin' ? 'Admin' : 'Supervisor'} Portal…</div>
                  </motion.div>
                ) : (
                  <>
                    {/* Code sent card */}
                    <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 14, padding: 14, marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: channel === 'email' ? 'rgba(99,102,241,0.1)' : 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {channel === 'email' ? <Mail size={16} color="#818cf8" /> : <Phone size={16} color="#06b6d4" />}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#475569' }}>One-time code sent to</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', fontFamily: 'DM Mono, monospace' }}>
                            {channel === 'email' ? maskEmail(user.email) : maskPhone(user.phone)}
                          </div>
                        </div>
                      </div>

                      {/* Message preview */}
                      <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, marginBottom: 6, letterSpacing: 0.4 }}>
                          {channel === 'email' ? '📧 EMAIL' : '📱 SMS / WHATSAPP'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, lineHeight: 1.6 }}>
                          Hi <strong style={{ color: '#f1f5f9' }}>{user.name}</strong>, your one-time login code for Procurement Tracker:
                        </div>

                        {/* OTP reveal */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{
                            fontSize: 32, fontWeight: 900, letterSpacing: 10,
                            fontFamily: 'DM Mono, monospace',
                            color: showCode ? '#10b981' : 'transparent',
                            background: showCode ? 'none' : '#1a2235',
                            borderRadius: showCode ? 0 : 8,
                            padding: showCode ? '2px 0' : '4px 14px',
                            transition: 'all 0.2s',
                            userSelect: showCode ? 'text' : 'none',
                            minWidth: 160,
                          }}>
                            {showCode ? otpCode : '••••••'}
                          </div>
                          <button onClick={() => setShowCode(v => !v)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: 11, fontFamily: 'inherit', flexShrink: 0 }}>
                            {showCode ? <EyeOff size={12} /> : <Eye size={12} />}
                            {showCode ? 'Hide' : 'Show'}
                          </button>
                        </div>

                        <div style={{ fontSize: 10, color: '#475569', marginTop: 8 }}>
                          This code is valid for 3 minutes and can only be used once.
                        </div>
                      </div>
                    </div>

                    {/* 6-digit input */}
                    <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>Enter the 6-digit code</p>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }} onPaste={handlePaste}>
                      {digits.map((d, i) => (
                        <input
                          key={i}
                          ref={el => { inputRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={e => handleDigit(i, e.target.value)}
                          onKeyDown={e => handleKey(i, e)}
                          style={{
                            width: 44, height: 52, borderRadius: 11, textAlign: 'center',
                            fontSize: 22, fontWeight: 800, fontFamily: 'DM Mono, monospace',
                            background: d ? 'rgba(99,102,241,0.15)' : '#1a2235',
                            border: `2px solid ${error ? '#ef4444' : d ? '#6366f1' : '#1e2d45'}`,
                            color: '#f1f5f9', outline: 'none', transition: 'all 0.15s',
                            caretColor: '#6366f1',
                          }}
                        />
                      ))}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '9px 13px', marginBottom: 10 }}>
                          <AlertTriangle size={13} color="#ef4444" />
                          <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Countdown */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                      <Clock size={12} color={expired ? '#ef4444' : countdown < 60 ? '#f59e0b' : '#475569'} />
                      <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: expired ? '#ef4444' : countdown < 60 ? '#f59e0b' : '#475569' }}>
                        {expired ? 'Code expired' : `Expires in ${fmt(countdown)}`}
                      </span>
                    </div>

                    {/* Verify button */}
                    <button
                      onClick={() => verify()}
                      disabled={!filled || expired || attempts >= 4}
                      style={{
                        width: '100%', borderRadius: 13, padding: '14px',
                        background: filled && !expired && attempts < 4 ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#1a2235',
                        border: filled && !expired && attempts < 4 ? 'none' : '1px solid #1e2d45',
                        color: filled && !expired && attempts < 4 ? 'white' : '#475569',
                        fontSize: 15, fontWeight: 700, cursor: filled && !expired ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        marginBottom: 12, transition: 'all 0.2s',
                      }}
                    >
                      <Lock size={16} /> Verify & Enter Portal
                    </button>

                    {/* Resend */}
                    <div style={{ textAlign: 'center' }}>
                      {resendWait > 0 ? (
                        <span style={{ fontSize: 12, color: '#475569' }}>Resend in {resendWait}s</span>
                      ) : (
                        <button onClick={() => issueOTP(channel)}
                          style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <RefreshCw size={13} /> Send New Code
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
