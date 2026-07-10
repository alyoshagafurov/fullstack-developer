import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Alisher Gafurov — Full-Stack Developer';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 80,
          background: '#070707', color: '#F4F4F5',
          backgroundImage:
            'radial-gradient(60% 60% at 20% 0%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(0deg,#070707,#0A0A0A)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', color: '#070707', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>AG</div>
          <span style={{ color: '#A1A1AA' }}>alishergafurov.dev</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Alisher Gafurov</div>
          <div style={{ fontSize: 40, fontWeight: 600, color: '#71717A', marginTop: 18, letterSpacing: '-0.02em' }}>
            Full-Stack Developer
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 22, color: '#A1A1AA' }}>
          {['Websites', 'Web Apps', 'E-commerce', 'SaaS'].map((t) => (
            <span key={t} style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '8px 20px' }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
