// Shared palette for every generated profile asset. Keep in sync with
// .github/profile-3d.json (the 3D city colors) and the README card params.

export const ACCENT = '#3ddc97';
export const BG_START = '#0d1117';
export const BG_END = '#0f1f1a';
export const BORDER = '#30363d';
export const TEXT = '#e6edf3';
export const TEXT_MUTED = '#8b949e';
export const PANEL = '#161b22';
export const FONT = "'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace";

export const CITY_GREENS = ['#161b22', '#0e4429', '#1f7a4d', '#2fb67a', '#3ddc97'];

export const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

export const formatNumber = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('en-US'));

export const backgroundGradient = (id) => `
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BG_START}"/>
      <stop offset="1" stop-color="${BG_END}"/>
    </linearGradient>`;
