import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

/* ALY brand mark — the owner's real "aly" wordmark on warm near-black. High-res
   so it works as the browser tab / Google favicon and the Organization logo. */
export default function Icon() {
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
        <img src={logo} width={368} height={207} alt="ALY" />
      </div>
    ),
    { ...size },
  );
}
