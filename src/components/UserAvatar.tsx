import React from 'react';
import { AuthUser } from './PortalSelect';

interface Props {
  user: AuthUser;
  size?: number;
}

export default function UserAvatar({ user, size = 36 }: Props) {
  const fontSize = Math.round(size * 0.38);
  if (user.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt={user.name}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(212,175,55,0.3)',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      border: '1.5px solid rgba(212,175,55,0.25)',
    }}>
      <span style={{ fontSize, fontWeight: 800, color: 'var(--primary-vivid)', lineHeight: 1 }}>
        {user.initials || user.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
