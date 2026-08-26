import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/* Apple touch icon — the real ALY wordmark on warm near-black (iOS rounds the corners). */
export default function AppleIcon() {
  const logo = `data:image/png;base64,${readFileSync(join(process.cwd(), 'app/aly-logo.png')).toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: '#191817',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={128} height={72} alt="ALY" />
      </div>
    ),
    { ...size },
  );
}
