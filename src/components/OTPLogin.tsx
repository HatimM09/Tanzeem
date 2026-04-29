import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, HardHat, BookOpen,
  ArrowLeft, RefreshCw, CheckCircle,
  Mail, Phone, Eye, EyeOff,
} from 'lucide-react';
import { requestOTP, verifyOTP, saveAuth, AuthUser } from '../lib/auth';

type Step = 'select' | 'enter-otp' | 'verifying' | 'success';

interface Props {
  onAuthenticated: (portal: 'admin' | 'supervisor', user: AuthUser) => void;
  serverOnline: boolean | null;
}

export default function OTPLogin({ onAuthenticated, serverOnline }: Props) {
  const [role, setRole]             = useState<'admin' | 'supervisor' | null>(null);
  const [step, setStep]             = useState<Step>('select');
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [liveOtp, setLiveOtp]       = useState<string | null>(null);   // shown on screen
  const [showOtp, setShowOtp]       = useState(false);                  // toggle visibility
  const [error, setError]           = useState<string | null>(null);
  const [cooldown, setCooldown]     = useState(0);
  const [welcomeName, setWelcomeName] = useState('');
  const [expirySecs, setExpirySecs] = useState(300);

  const inputRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown(c => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cooldown]);

  // OTP expiry countdown
  useEffect(() => {
    if (step === 'enter-otp') {
      setExpirySecs(300);
      expiryRef.current = setInterval(() => {
        setExpirySecs(s => {
          if (s <= 1) {
            clearInterval(expiryRef.current!);
            setError('Code expired. Please request a new one.');
            setLiveOtp(null);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (expiryRef.current) clearInterval(expiryRef.current); };
  }, [step]);

  const formatExpiry = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Select portal & generate OTP ──────────────────────────────────────────
  const handleSelectRole = (r: 'admin' | 'supervisor') => {
    setRole(r);
    setError(null);
    setOtp(['', '', '', '', '', '']);
    setShowOtp(false);

    const result = requestOTP(r);
    setMaskedEmail(result.maskedEmail);
    setMaskedPhone(result.maskedPhone);
    setLiveOtp(result.otp);
    setStep('enter-otp');
    setCooldown(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 200);
  };

  // ── OTP input handling ────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && index === 5) {
      const code = next.join('');
      if (code.length === 6) handleVerify(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      handleVerify(pasted);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length < 6 || !role) return;
    setStep('verifying');
    setError(null);

    setTimeout(() => {
      try {
        const res = verifyOTP(role, otpCode);
        saveAuth(res.token, res.user);
        setWelcomeName(res.user.name);
        setLiveOtp(null);
        setStep('success');
        setTimeout(() => onAuthenticated(role, res.user), 1800);
      } catch (e: any) {
        setError(e.message);
        setOtp(['', '', '', '', '', '']);
        setStep('enter-otp');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }, 900); // brief delay for UX feel
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = () => {
    if (cooldown > 0 || !role) return;
    setError(null);
    setOtp(['', '', '', '', '', '']);
    setShowOtp(false);
    const result = requestOTP(role);
    setLiveOtp(result.otp);
    setCooldown(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const otpFilled = otp.join('').length === 6;

  return (
    <div className="fade-in" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', background: '#0a0e1a',
    }}>
      {/* ── Logo ── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        style={{ marginBottom: 28, textAlign: 'center' }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 22, margin: '0 auto 14px',
          background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}>
          <BookOpen size={36} color="white" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>
          Procurement Tracker
        </h1>
        <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 600, margin: '0 0 2px' }}>
          Mahad al Zahra, Galiakot
        </p>
        <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>
          From: Tanzeem Department
        </p>
      </motion.div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <AnimatePresence mode="wait">

          {/* ── STEP: Select portal ── */}
          {step === 'select' && (
            <motion.div key="select"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            >
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
                Select your portal — a one-time code will be generated
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleSelectRole('admin')}
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 16, padding: '20px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={22} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Admin Portal</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                        Manage items · Barcodes · Complaints
                      </div>
                    </div>
                  </div>
                </motion.button>

                <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleSelectRole('supervisor')}
                  style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 16, padding: '20px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HardHat size={22} color="#06b6d4" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Supervisor Portal</div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                        Scan items · History · Complaints
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: Enter OTP ── */}
          {(step === 'enter-otp' || step === 'verifying') && (
            <motion.div key="otp"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            >
              {/* Back */}
              {step === 'enter-otp' && (
                <button
                  onClick={() => { setStep('select'); setRole(null); setError(null); setLiveOtp(null); }}
                  style={{ background: 'none', border: 'none', color: '#475569', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, padding: 0, fontFamily: 'inherit' }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}

              {/* Portal + delivery info */}
              <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {role === 'admin'
                      ? <ShieldCheck size={17} color="#818cf8" />
                      : <HardHat size={17} color="#06b6d4" />
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                      {role === 'admin' ? 'Admin Portal' : 'Supervisor Portal'}
                    </div>
                    <div style={{ fontSize: 11, color: '#475569' }}>
                      Code sent to your registered contacts
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={12} color="#475569" />
                    <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'DM Mono, monospace' }}>{maskedEmail}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={12} color="#475569" />
                    <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'DM Mono, monospace' }}>{maskedPhone}</span>
                  </div>
                </div>
              </div>

              {/* ── OTP Code Display Box ── */}
              {liveOtp && step === 'enter-otp' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.12))',
                    border: '1px solid rgba(99,102,241,0.35)',
                    borderRadius: 14, padding: '14px 16px', marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, letterSpacing: 0.5 }}>
                      🔐 YOUR ONE-TIME CODE
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: expirySecs < 60 ? '#ef4444' : '#f59e0b', fontFamily: 'DM Mono, monospace' }}>
                        ⏱ {formatExpiry(expirySecs)}
                      </span>
                      <button
                        onClick={() => setShowOtp(v => !v)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                        title={showOtp ? 'Hide code' : 'Show code'}
                      >
                        {showOtp
                          ? <EyeOff size={15} color="#6366f1" />
                          : <Eye size={15} color="#6366f1" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Code digits */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {liveOtp.split('').map((digit, i) => (
                      <div key={i} style={{
                        width: 40, height: 48,
                        background: 'rgba(99,102,241,0.2)',
                        border: '1px solid rgba(99,102,241,0.4)',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: showOtp ? 22 : 18,
                        fontWeight: 900,
                        fontFamily: 'DM Mono, monospace',
                        color: showOtp ? '#c7d2fe' : '#475569',
                        letterSpacing: 0,
                        transition: 'all 0.2s',
                      }}>
                        {showOtp ? digit : '•'}
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', margin: '8px 0 0' }}>
                    Tap <Eye size={10} style={{ verticalAlign: 'middle' }} /> to {showOtp ? 'hide' : 'reveal'} · Enter below to login
                  </p>
                </motion.div>
              )}

              {/* OTP input boxes */}
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
                Enter the 6-digit code
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={step === 'verifying'}
                    style={{
                      width: 46, height: 54,
                      background: digit ? 'rgba(99,102,241,0.15)' : '#1a2235',
                      border: `2px solid ${error ? '#ef4444' : digit ? '#6366f1' : '#1e2d45'}`,
                      borderRadius: 12,
                      color: '#f1f5f9',
                      fontSize: 22, fontWeight: 800,
                      textAlign: 'center',
                      fontFamily: 'DM Mono, monospace',
                      outline: 'none',
                      transition: 'border-color 0.2s, background 0.2s',
                      opacity: step === 'verifying' ? 0.6 : 1,
                    }}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 14 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <button
                onClick={() => handleVerify()}
                disabled={!otpFilled || step === 'verifying'}
                style={{
                  width: '100%', borderRadius: 12, padding: '14px',
                  background: step === 'verifying'
                    ? '#1a2235'
                    : otpFilled
                    ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
                    : '#1a2235',
                  border: otpFilled && step !== 'verifying' ? 'none' : '1px solid #1e2d45',
                  color: otpFilled && step !== 'verifying' ? 'white' : '#475569',
                  fontSize: 15, fontWeight: 700,
                  cursor: otpFilled && step !== 'verifying' ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', marginBottom: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {step === 'verifying' ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      style={{ width: 16, height: 16, border: '2px solid #475569', borderTopColor: '#818cf8', borderRadius: '50%' }}
                    />
                    Verifying…
                  </>
                ) : 'Verify & Login'}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center' }}>
                {cooldown > 0 ? (
                  <span style={{ fontSize: 12, color: '#475569' }}>
                    Resend in <strong style={{ color: '#f59e0b' }}>{cooldown}s</strong>
                  </span>
                ) : (
                  <button onClick={handleResend}
                    style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
                  >
                    <RefreshCw size={13} /> Get New Code
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP: Success ── */}
          {step === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '30px 0' }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={34} color="#10b981" />
                </div>
              </motion.div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px' }}>
                Verified! ✓
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 6px' }}>{welcomeName}</p>
              <p style={{ color: '#475569', fontSize: 12 }}>
                Redirecting to {role} portal…
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: serverOnline === null ? '#f59e0b' : serverOnline ? '#10b981' : '#ef4444' }} />
          <span style={{ color: '#475569', fontSize: 11 }}>
            {serverOnline === null ? 'Connecting…' : serverOnline ? 'Server online' : 'Offline mode'}
          </span>
        </div>
        <p style={{ color: '#1e2d45', fontSize: 10, margin: 0 }}>
          © Mahad al Zahra · Al Jamea Tus Saifiyah, Galiakot
        </p>
      </div>
    </div>
  );
}
