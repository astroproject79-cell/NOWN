'use client';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LogoSvg({ size = 22, color, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <circle cx="12" cy="12" r="5.5" stroke={color} strokeWidth="0.5" opacity="0.35" />
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.7" />
      <line x1="12" y1="1" x2="12" y2="4.5" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <line x1="12" y1="19.5" x2="12" y2="23" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <line x1="1" y1="12" x2="4.5" y2="12" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <line x1="19.5" y1="12" x2="23" y2="12" stroke={color} strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

export function Ico({ d, size = 20, color, sw = 1 }: { d: string; size?: number; color?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function SvgSun({ size = 16, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="4" fill={color} opacity="0.85" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={a}
            x1={10 + Math.cos(r) * 6.5} y1={10 + Math.sin(r) * 6.5}
            x2={10 + Math.cos(r) * 8.5} y2={10 + Math.sin(r) * 8.5}
            stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"
          />
        );
      })}
    </svg>
  );
}

export function SvgMoon({ size = 16, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color} opacity="0.7">
      <path d="M17 10.5A7 7 0 119.5 3a5.5 5.5 0 007.5 7.5z" />
    </svg>
  );
}

export function ConstellationSvg({ color, style }: { color?: string; style?: React.CSSProperties }) {
  return (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none" style={style}>
      <circle cx="12" cy="22" r="1.8" fill={color} opacity="0.6" />
      <circle cx="35" cy="10" r="1.2" fill={color} opacity="0.45" />
      <circle cx="55" cy="30" r="2" fill={color} opacity="0.7" />
      <circle cx="78" cy="14" r="1.4" fill={color} opacity="0.5" />
      <circle cx="50" cy="50" r="1.6" fill={color} opacity="0.55" />
      <circle cx="88" cy="42" r="1.2" fill={color} opacity="0.4" />
      <line x1="12" y1="22" x2="35" y2="10" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <line x1="35" y1="10" x2="55" y2="30" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <line x1="55" y1="30" x2="78" y2="14" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <line x1="55" y1="30" x2="50" y2="50" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <line x1="50" y1="50" x2="88" y2="42" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <line x1="78" y1="14" x2="88" y2="42" stroke={color} strokeWidth="0.4" opacity="0.2" />
    </svg>
  );
}

export function OrbitRingSvg({ size = 420, color, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 420 420" fill="none" style={style}>
      <ellipse cx="210" cy="210" rx="200" ry="75" stroke={color} strokeWidth="0.5" transform="rotate(-22 210 210)" />
      <ellipse cx="210" cy="210" rx="155" ry="58" stroke={color} strokeWidth="0.4" transform="rotate(18 210 210)" />
      <ellipse cx="210" cy="210" rx="110" ry="40" stroke={color} strokeWidth="0.3" transform="rotate(-48 210 210)" />
    </svg>
  );
}

export function ScrollIndicator({ color }: { color?: string }) {
  return (
    <svg width="16" height="28" viewBox="0 0 16 28" fill="none" style={{ opacity: 0.4 }}>
      <rect x="1" y="1" width="14" height="26" rx="7" stroke={color} strokeWidth="0.8" />
      <circle cx="8" cy="9" r="1.5" fill={color} opacity="0.6">
        <animate attributeName="cy" values="8;18;8" dur="2.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export const ICON_PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  hex: 'M12 2l9 5v10l-9 5-9-5V7l9-5z',
  wave: 'M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  zap: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  check: 'M20 6L9 17l-5-5',
};
