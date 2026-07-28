import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Alisher Gafurov (Aly) — Full-Stack Developer, Software Engineer · Dushanbe, Tajikistan';

/* Social share card — ALY brand + Alisher Gafurov + roles + stack. Monochrome. */
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72,
          background: '#070707', color: '#F4F4F5',
          backgroundImage:
            'radial-gradient(65% 60% at 18% 0%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(0deg,#070707,#0A0A0A)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: 40, letterSpacing: '-0.05em' }}>aly</div>
          <div style={{ color: '#A1A1AA' }}>aly.lat</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Alisher Gafurov</div>
          <div style={{ fontSize: 38, fontWeight: 600, color: '#C4C4CC', marginTop: 20, letterSpacing: '-0.02em' }}>
            Full-Stack Developer · Software Engineer
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, color: '#71717A', marginTop: 12 }}>
            Dushanbe · Tajikistan
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 22, color: '#A1A1AA', flexWrap: 'wrap' }}>
          {['Next.js', 'React', 'Node.js', 'TypeScript', 'SaaS', 'CRM'].map((t) => (
            <span key={t} style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '8px 22px' }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
