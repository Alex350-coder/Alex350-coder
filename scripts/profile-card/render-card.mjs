import { ACCENT, BORDER, FONT, backgroundGradient, escapeXml, formatNumber } from './theme.mjs';

const WIDTH = 840;
const HEIGHT = 270;
const PIXEL = 7;
const FALLBACK_LANG_COLORS = ['#a97bff', '#dea584', '#f1e05a', '#3572a5'];

function wrap(text, maxChars, maxLines) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if ((line + ' ' + word).trim().length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,1}$/, '…');
  }
  return lines;
}

function renderAvatar(pixels, x, y) {
  const size = pixels.length * PIXEL;
  const rows = pixels
    .map((row, ry) => {
      const cells = row
        .map((color, rx) => `<rect x="${rx * PIXEL}" y="${ry * PIXEL}" width="${PIXEL}" height="${PIXEL}" fill="${color}"/>`)
        .join('');
      return `<g class="row" style="animation-delay:${(ry * 0.04).toFixed(2)}s">${cells}</g>`;
    })
    .join('');
  return `
  <g transform="translate(${x},${y})">
    <rect x="-8" y="-8" width="${size + 15}" height="${size + 15}" rx="10" fill="#0b1512" stroke="${ACCENT}" stroke-opacity=".5"/>
    ${rows}
    <rect class="scan" x="-1" y="0" width="${size + 1}" height="3" fill="${ACCENT}" opacity=".55"/>
  </g>`;
}

function renderStats(profile, x, y) {
  const stats = [
    ['▣', 'Repositories', profile.repoCount],
    ['★', 'Stars', profile.stars],
    ['◆', 'Contributions (year)', profile.contributions],
    ['●', 'Followers', profile.followers],
  ];
  return stats
    .map(
      ([icon, label, value], i) => `
    <g class="fade" style="animation-delay:${(0.6 + i * 0.15).toFixed(2)}s" transform="translate(${x + (i % 2) * 230},${y + Math.floor(i / 2) * 26})">
      <text fill="${ACCENT}" font-size="14">${icon}</text>
      <text x="22" fill="#e6edf3" font-size="14" font-weight="700">${formatNumber(value)}</text>
      <text x="72" fill="#8b949e" font-size="13">${label}</text>
    </g>`,
    )
    .join('');
}

function renderLanguages(languages, x, y) {
  let offset = 0;
  return languages
    .map((lang, i) => {
      const color = lang.color || FALLBACK_LANG_COLORS[i % FALLBACK_LANG_COLORS.length];
      const width = lang.name.length * 7.5 + 30;
      const chip = `
    <g class="fade" style="animation-delay:${(1.3 + i * 0.1).toFixed(2)}s" transform="translate(${x + offset},${y})">
      <rect width="${width}" height="22" rx="11" fill="#161b22" stroke="#30363d"/>
      <circle cx="12" cy="11" r="4" fill="${color}"/>
      <text x="22" y="15" fill="#c9d1d9" font-size="11">${escapeXml(lang.name)}</text>
    </g>`;
      offset += width + 8;
      return chip;
    })
    .join('');
}

export function renderCard(profile, pixels) {
  const avatarSize = pixels.length * PIXEL;
  const avatarX = WIDTH - avatarSize - 40;
  const avatarY = (HEIGHT - avatarSize) / 2;
  const bioLines = wrap(profile.bio, 46, 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" font-family="${FONT}">
  <title>${escapeXml(profile.name)} — GitHub profile card</title>
  <style>
    .row { opacity: 0; animation: appear .25s ease-out forwards; }
    .fade { opacity: 0; animation: appear .5s ease-out forwards; }
    .scan { animation: scan 3.5s linear 1.2s infinite; opacity: 0; }
    .cursor { animation: blink 1s steps(1) infinite; }
    @keyframes appear { to { opacity: 1; } }
    @keyframes scan { 0% { transform: translateY(0); opacity: .55; } 100% { transform: translateY(${avatarSize - 3}px); opacity: .55; } }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
  <defs>${backgroundGradient('bg')}
  </defs>
  <rect x=".5" y=".5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="16" fill="url(#bg)" stroke="${BORDER}"/>

  <g class="fade" style="animation-delay:.1s">
    <text x="36" y="44" fill="${ACCENT}" font-size="14">@${escapeXml(profile.login)}<tspan class="cursor">_</tspan></text>
    <text x="36" y="80" fill="#e6edf3" font-size="28" font-weight="700">${escapeXml(profile.name)}</text>
    ${bioLines.map((l, i) => `<text x="36" y="${104 + i * 17}" fill="#8b949e" font-size="12">${escapeXml(l)}</text>`).join('')}
  </g>

  ${renderStats(profile, 36, 160)}
  ${renderLanguages(profile.languages, 36, 220)}
  ${renderAvatar(pixels, avatarX, avatarY)}
</svg>
`;
}
