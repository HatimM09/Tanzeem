// Auth store — contacts saved in localStorage, sessions are ONE-TIME only (never persisted)

export type Portal = 'admin' | 'supervisor';

export interface PortalUser {
  name: string;
  email: string;
  phone: string;
}

// OTP is valid for 3 minutes
export const OTP_EXPIRY_MS = 3 * 60 * 1000;

const STORAGE_KEY = 'pt_user';

/** Load saved user for a portal from localStorage */
export function getSavedUser(portal: Portal): PortalUser | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${portal}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Persist user for next login */
export function saveUser(portal: Portal, user: PortalUser): void {
  localStorage.setItem(`${STORAGE_KEY}_${portal}`, JSON.stringify(user));
}

/** Generate a random 6-digit OTP */
export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Mask email: ab***@domain.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return email;
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

/** Mask phone: +92****567 */
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\s/g, '');
  if (clean.length < 6) return phone;
  return clean.slice(0, 3) + '****' + clean.slice(-3);
}
