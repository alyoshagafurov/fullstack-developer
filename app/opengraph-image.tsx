import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Alisher Gafurov (Aly) — Full-Stack Developer, Software Engineer · Dushanbe, Tajikistan';

/* Social share card — real ALY wordmark + Alisher Gafurov + roles + stack. Dark Luxury. */
export default function OG() {
  const logo = `data:image/png;base64,${readFileSync(join(process.cwd(), 'app/aly-logo.png')).toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72,
          background: '#141210', color: '#EBE7E1',
          backgroundImage:
            'radial-gradient(70% 65% at 12% 2%, rgba(121,82,56,0.28), transparent 58%), linear-gradient(0deg,#141210,#1B1917)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={104} height={59} alt="ALY" />
          <div style={{ color: '#AEA7A3' }}>aly.lat</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Alisher Gafurov</div>
          <div style={{ fontSize: 38, fontWeight: 600, color: '#C7B6A6', marginTop: 20, letterSpacing: '-0.02em' }}>
            Full-Stack Developer · Software Engineer
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, color: '#857F79', marginTop: 12 }}>
            Dushanbe · Tajikistan
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 22, color: '#AEA7A3', flexWrap: 'wrap' }}>
          {['Next.js', 'React', 'Node.js', 'TypeScript', 'SaaS', 'CRM'].map((t) => (
            <span key={t} style={{ border: '1px solid rgba(174,167,163,0.22)', borderRadius: 999, padding: '8px 22px' }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
