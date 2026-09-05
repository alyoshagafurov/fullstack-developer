import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Alisher Gafurov (Aly) — Full-Stack Developer, Software Engineer · Dushanbe, Tajikistan';

/*
 * Social share card, on the site's own material: graphite, warm white, the
 * one copper mark, and the LED track under the name — so a shared link
 * previews as the site it opens. The wordmark is the owner's PNG, inlined.
 *
 * Satori draws this, so it is flexbox only and the type is its bundled
 * sans: the display face is not loaded here (woff2 is not accepted), and a
 * card at this size reads by palette and structure, not by the face.
 */
const INK = '#F7F4F0';
const INK_2 = 'rgba(247,244,240,0.7)';
const INK_3 = 'rgba(247,244,240,0.5)';
const EDGE = 'rgba(247,244,240,0.2)';
const COPPER = '#C0996F';

export default function OG() {
  const logo = `data:image/png;base64,${readFileSync(join(process.cwd(), 'app/aly-logo.png')).toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72,
          background: '#0C0C0E', color: INK,
          backgroundImage: 'radial-gradient(60% 55% at 50% 0%, rgba(192,153,111,0.16), transparent 70%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={104} height={59} alt="ALY" />
          <div style={{ color: INK_3, letterSpacing: '0.14em' }}>ALY.LAT</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            Alisher Gafurov
          </div>
          <div style={{ fontSize: 36, color: INK_2, marginTop: 18, letterSpacing: '-0.01em' }}>
            Full-Stack Developer · Software Engineer
          </div>
          {/* the LED track */}
          <div
            style={{
              width: '100%', height: 1, marginTop: 36,
              background:
                'linear-gradient(90deg, rgba(255,233,206,0) 0%, rgba(255,233,206,0.9) 18%, rgba(255,233,206,0.9) 72%, rgba(255,233,206,0) 100%)',
              boxShadow: '0 0 20px 2px rgba(192,153,111,0.35)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: INK_3, marginTop: 28 }}>
            <span style={{ width: 10, height: 10, background: COPPER }} />
            Dushanbe · Tajikistan
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 22, color: INK_2, flexWrap: 'wrap' }}>
          {['Next.js', 'React', 'Node.js', 'TypeScript', 'SaaS', 'CRM'].map((t) => (
            <span key={t} style={{ border: `1px solid ${EDGE}`, borderRadius: 4, padding: '8px 20px' }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
