/**
 * Client-side OTP Authentication
 * Works fully without a backend server.
 * OTP is generated locally, shown on-screen (simulating email/SMS delivery).
 * In production, replace generateAndSendOTP() with a real email/SMS API call.
 */

const TOKEN_KEY = 'pt_auth_token';
const USER_KEY  = 'pt_auth_user';

export interface AuthUser {
  id:    string;
  name:  string;
  role:  'admin' | 'supervisor';
  email: string;
  phone: string;
}

// ── Registered users (hardcoded credentials) ─────────────────────────────
// In production, fetch these from your backend/database.
const USERS: Record<'admin' | 'supervisor', AuthUser> = {
  admin: {
    id:    'usr-admin-001',
    name:  'Admin — Tanzeem Department',
    role:  'admin',
    email: 'admin@mahadalzahra.edu',
    phone: '+91 98765 43210',
  },
  supervisor: {
    id:    'usr-sup-001',
    name:  'Supervisor — Mahad al Zahra',
    role:  'supervisor',
    email: 'supervisor@mahadalzahra.edu',
    phone: '+91 98765 00001',
  },
};

// ── In-memory OTP store (per role, expires in 5 min) ─────────────────────
interface OTPRecord {
  code:      string;
  role:      'admin' | 'supervisor';
  expiresAt: number;
  attempts:  number;
}

const otpStore: Partial<Record<'admin' | 'supervisor', OTPRecord>> = {};

// ── Generate 6-digit OTP ──────────────────────────────────────────────────
function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Mask email: a***@domain.com ───────────────────────────────────────────
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}`;
}

// ── Mask phone: +91 *****43210 ────────────────────────────────────────────
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const last4  = digits.slice(-4);
  const prefix = phone.slice(0, 4);
  return `${prefix} *****${last4}`;
}

// ── Request OTP (client-side generation) ─────────────────────────────────
export function requestOTP(role: 'admin' | 'supervisor'): {
  maskedEmail: string;
  maskedPhone: string;
  otp: string;           // shown on screen (simulates email/SMS)
  expiresIn: number;     // seconds
} {
  const user = USERS[role];
  const code = generateOTP();

  otpStore[role] = {
    code,
    role,
    expiresAt: Date.now() + 5 * 60 * 1000,  // 5 minutes
    attempts:  0,
  };

  return {
    maskedEmail: maskEmail(user.email),
    maskedPhone: maskPhone(user.phone),
    otp:         code,
    expiresIn:   300,
  };
}

// ── Verify OTP ────────────────────────────────────────────────────────────
export function verifyOTP(role: 'admin' | 'supervisor', inputCode: string): {
  success: true;
  user: AuthUser;
  token: string;
} {
  const record = otpStore[role];

  if (!record) {
    throw new Error('No OTP requested. Please request a new code.');
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[role];
    throw new Error('Code expired. Please request a new one.');
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    delete otpStore[role];
    throw new Error('Too many attempts. Please request a new code.');
  }

  if (inputCode.trim() !== record.code) {
    const left = 5 - record.attempts;
    throw new Error(`Invalid code. ${left} attempt${left !== 1 ? 's' : ''} remaining.`);
  }

  // ✓ Valid — clear OTP and issue session token
  delete otpStore[role];
  const token = `pt_${role}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const user  = USERS[role];

  return { success: true, user, token };
}

// ── Token / session storage (localStorage = persists across refresh/tab close) ──
export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSavedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

/** Only called on explicit logout — clears everything */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
