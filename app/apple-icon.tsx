import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/* Apple touch icon — ALY mark on matte black (iOS rounds the corners). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#070707', color: '#ffffff',
          fontSize: 96, fontWeight: 800, letterSpacing: '-0.06em',
        }}
      >
        aly
      </div>
    ),
    { ...size },
  );
}
