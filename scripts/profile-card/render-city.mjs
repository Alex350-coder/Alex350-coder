import { ACCENT, BORDER, FONT, TEXT, TEXT_MUTED, backgroundGradient, formatNumber } from './theme.mjs';

const WIDTH = 840;
const HEADER = 78;
const PADDING = 20;

// Deterministic "sky pixels" so the output only changes when the data does.
function skyPixels(count, width, height) {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, (_, i) => {
    const size = rand() > 0.8 ? 3 : 2;
    const x = Math.round(rand() * width);
    const y = Math.round(HEADER + rand() * height * 0.45);
    const delay = (rand() * 4).toFixed(2);
    return `<rect class="cf-twinkle" style="animation-delay:${delay}s" x="${x}" y="${y}" width="${size}" height="${size}" fill="${i % 3 ? TEXT_MUTED : ACCENT}"/>`;
  }).join('');
}

// Wraps the github-profile-3d-contrib SVG in a framed panel that matches the
// profile card: same gradient, border and typography, plus a grid and glow.
export function renderCity(citySvg, profile) {
  const match = citySvg.match(/^<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>\s*$/);
  if (!match) throw new Error('Unexpected 3D city SVG format');
  const [, viewBox, inner] = match;
  const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(Number);

  const cityWidth = WIDTH - PADDING * 2;
  const cityHeight = Math.round((cityWidth * vbHeight) / vbWidth);
  const height = HEADER + cityHeight + PADDING;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">
  <title>3D contribution city</title>
  <style>
    .cf-frame text { font-family: ${FONT}; }
    .cf-twinkle { animation: cf-twinkle 4s ease-in-out infinite; }
    .cf-cursor { animation: cf-blink 1s steps(1) infinite; }
    @keyframes cf-twinkle { 0%, 100% { opacity: .15; } 50% { opacity: .9; } }
    @keyframes cf-blink { 50% { opacity: 0; } }
  </style>
  <defs>${backgroundGradient('cf-bg')}
    <pattern id="cf-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="${ACCENT}" stroke-opacity=".07"/>
    </pattern>
    <radialGradient id="cf-glow" cx=".5" cy=".62" r=".55">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="cf-clip"><rect width="${WIDTH}" height="${height}" rx="16"/></clipPath>
  </defs>

  <g class="cf-frame" clip-path="url(#cf-clip)">
    <rect width="${WIDTH}" height="${height}" fill="url(#cf-bg)"/>
    <rect width="${WIDTH}" height="${height}" fill="url(#cf-grid)"/>
    <rect y="${HEADER}" width="${WIDTH}" height="${height - HEADER}" fill="url(#cf-glow)"/>
    ${skyPixels(36, WIDTH, cityHeight)}

    <text x="28" y="38" fill="${TEXT}" font-size="18" font-weight="700">The city I built this year<tspan class="cf-cursor" fill="${ACCENT}">_</tspan></text>
    <text x="28" y="60" fill="${ACCENT}" font-size="12" letter-spacing="1.5">CONTRIBUTIONS <tspan fill="${TEXT}" font-weight="700">${formatNumber(profile.contributions)}</tspan></text>
    <g transform="translate(${WIDTH - 148},26)">
      <rect width="120" height="26" rx="13" fill="#0b1512" stroke="${ACCENT}" stroke-opacity=".5"/>
      <text x="60" y="17" fill="${ACCENT}" font-size="11" text-anchor="middle">3D view · live</text>
    </g>
    <line x1="28" y1="${HEADER - 6}" x2="${WIDTH - 28}" y2="${HEADER - 6}" stroke="${BORDER}"/>

    <svg x="${PADDING}" y="${HEADER}" width="${cityWidth}" height="${cityHeight}" viewBox="${viewBox}">${inner}</svg>
  </g>
  <rect x=".5" y=".5" width="${WIDTH - 1}" height="${height - 1}" rx="16" fill="none" stroke="${BORDER}"/>
</svg>
`;
}
