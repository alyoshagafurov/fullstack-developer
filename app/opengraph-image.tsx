import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Alisher Gafurov (Aly) — Full-Stack Developer, Software Engineer · Dushanbe, Tajikistan';

/* Social share card — real ALY wordmark + Alisher Gafurov + roles + stack.
 *
 * On the site's own palette: matte black, #EEEEEE, and one small piece of
 * #00ADB5. It had been left on the pre-rebuild bronze scheme — warm greys
 * over a brown gradient — so a shared link previewed as a different site
 * from the one it opened. */
export default function OG() {
  const logo = `data:image/png;base64,${readFileSync(join(process.cwd(), 'app/aly-logo.png')).toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72,
          background: '#0C0D0F', color: '#EEEEEE',
          // A single faint wash of the signal colour, top-left, so the card
          // is not a flat rectangle. Everything else is the black.
          backgroundImage:
            'radial-gradient(70% 65% at 10% 0%, rgba(0,173,181,0.14), transparent 60%), linear-gradient(0deg,#0C0D0F,#15181C)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={104} height={59} alt="ALY" />
          <div style={{ color: 'rgba(238,238,238,0.5)' }}>aly.lat</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Alisher Gafurov</div>
          <div style={{ fontSize: 38, fontWeight: 600, color: 'rgba(238,238,238,0.66)', marginTop: 20, letterSpacing: '-0.02em' }}>
            Full-Stack Developer · Software Engineer
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 500, color: 'rgba(238,238,238,0.5)', marginTop: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#00ADB5' }} />
            Dushanbe · Tajikistan
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 22, color: 'rgba(238,238,238,0.66)', flexWrap: 'wrap' }}>
          {['Next.js', 'React', 'Node.js', 'TypeScript', 'SaaS', 'CRM'].map((t) => (
            <span key={t} style={{ border: '1px solid rgba(238,238,238,0.24)', borderRadius: 999, padding: '8px 22px' }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
