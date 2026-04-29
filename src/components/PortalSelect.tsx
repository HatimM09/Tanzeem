import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, HardHat, User, Lock, Box,
  ArrowRight, AlertCircle, Activity, Zap, Fingerprint,
} from 'lucide-react';

import { api } from '../lib/api';

export interface AuthUser {
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'inventory';
  initials: string;
  photoUrl?: string;
  token?: string;
}

interface PortalSelectProps {
  onSelect: (portal: 'admin' | 'supervisor' | 'inventory', user: any) => void;
  serverOnline: boolean | null;
}

export default function PortalSelect({ onSelect, serverOnline }: PortalSelectProps) {
  const [step, setStep] = useState<'login' | 'portal'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor' | 'inventory'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (serverOnline) {
        const result = await api.auth.login(email, password, role);
        const userName = result.user.user_metadata?.name || result.user.email?.split('@')[0] || 'User';
        const user = { 
          ...result.user, 
          name: userName,
          token: result.token, 
          initials: userName.slice(0, 2).toUpperCase() 
        };
        
        if (role === 'admin' || role === 'supervisor' || role === 'inventory') {
          // Take everyone directly to their selected portal
          onSelect(role, user);
        }
      } else {
        // Fallback for offline mode (if allowed) or error
        throw new Error('Server is offline. Please check connection.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="full-screen-view" style={{ alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Ambient Background Glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary), #f5d76e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 30px rgba(212,175,55,0.25)',
            }}
          >
            <Activity size={26} color="#0c0e14" strokeWidth={2.5} />
          </motion.div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1.5px', marginBottom: 4, lineHeight: 1 }}>
            Tanzeem
          </h1>
          <h2 className="gold-text" style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', margin: 0 }}>
            Management Portal
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.02, opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bright-panel"
              style={{ width: '100%', maxWidth: '420px', padding: '36px', position: 'relative', zIndex: 1 }}
            >
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: 0 }}>Sign in to manage your inventory</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Role Switcher */}
                <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <button type="button" onClick={() => setRole('admin')} style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: role === 'admin' ? 'var(--bg-card-hover)' : 'transparent',
                    color: role === 'admin' ? 'var(--primary-vivid)' : 'var(--text-dim)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: role === 'admin' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}>
                    <ShieldCheck size={14} /> Admin
                  </button>
                  <button type="button" onClick={() => setRole('supervisor')} style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: role === 'supervisor' ? 'var(--bg-card-hover)' : 'transparent',
                    color: role === 'supervisor' ? 'var(--primary-vivid)' : 'var(--text-dim)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: role === 'supervisor' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}>
                    <HardHat size={14} /> Supervisor
                  </button>
                  <button type="button" onClick={() => setRole('inventory')} style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: role === 'inventory' ? 'var(--bg-card-hover)' : 'transparent',
                    color: role === 'inventory' ? 'var(--primary-vivid)' : 'var(--text-dim)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: role === 'inventory' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}>
                    <Box size={14} /> Inventory
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <User size={12} /> Email Address
                  </label>
                  <input className="input-field" type="email" placeholder="admin@mahad.edu" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Lock size={12} /> Password
                  </label>
                  <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <AlertCircle size={16} color="#f87171" />
                    <span style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>{error}</span>
                  </motion.div>
                )}
                <button type="submit" disabled={loading} className="bright-button" style={{ marginTop: 4, fontSize: 14, padding: '14px' }}>
                  {loading ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0c0e14', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Signing in...</>
                  ) : (
                    <>Sign In <ArrowRight size={18} /></>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
              </form>
            </motion.div>
          )}

          {step === 'portal' && (
            <motion.div
              key="portal"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              style={{ width: '100%', maxWidth: '720px', position: 'relative', zIndex: 1 }}
            >
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>Select Dashboard</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Logged in as <span style={{ color: 'var(--primary-vivid)' }}>{loggedInUser?.name}</span></p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <motion.button
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect('admin', loggedInUser)}
                  className="bright-panel-glow"
                  style={{ border: '1px solid var(--border)', padding: '28px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'inherit' }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}>
                    <ShieldCheck size={24} color="#a78bfa" />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>Administrator Portal</div>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>Full access to inventory controls, statistics, and complaint resolution management.</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect('supervisor', loggedInUser)}
                  className="bright-panel-glow"
                  style={{ border: '1px solid var(--border)', padding: '28px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'inherit' }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                    <HardHat size={24} color="#34d399" />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>Supervisor Portal</div>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>Quick access to barcode scanning, field logging, and history tracking.</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect('inventory', loggedInUser)}
                  className="bright-panel-glow"
                  style={{ border: '1px solid var(--border)', padding: '28px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'inherit' }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}>
                    <Box size={24} color="#818cf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>Inventory Portal</div>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>Full inventory overview, stock levels, and automated catalog management.</p>
                  </div>
                </motion.button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ← Back to Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{ marginTop: 56, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <div className="pulse-dot" style={{ 
              width: 7, height: 7, borderRadius: '50%', 
              background: serverOnline === null ? '#f59e0b' : serverOnline ? '#34d399' : '#f87171',
              boxShadow: serverOnline === null ? '0 0 8px #f59e0b' : serverOnline ? '0 0 8px #34d399' : '0 0 8px #f87171'
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {serverOnline === null ? 'System Connecting...' : serverOnline ? 'System Connected' : 'System Offline'}
            </span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', opacity: 0.5 }}>© 2024 MAHAD AL ZAHRA · AL JAMEA TUS SAIFIYAH</p>
        </div>
      </div>
    </div>
  );
}
