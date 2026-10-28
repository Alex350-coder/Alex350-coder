import sharp from 'sharp';

const QUANT_STEP = 24;

const quantize = (v) => Math.min(255, Math.round(v / QUANT_STEP) * QUANT_STEP);
const hex = (v) => v.toString(16).padStart(2, '0');

// Downscales the avatar to a grid x grid image and returns it as rows of
// hex colors, ready to be drawn as SVG blocks.
export async function pixelateAvatar(url, grid = 24) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Avatar download failed: ${res.status} ${url}`);
  const input = Buffer.from(await res.arrayBuffer());

  const { data } = await sharp(input)
    .resize(grid, grid, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return Array.from({ length: grid }, (_, y) =>
    Array.from({ length: grid }, (_, x) => {
      const i = (y * grid + x) * 3;
      return `#${hex(quantize(data[i]))}${hex(quantize(data[i + 1]))}${hex(quantize(data[i + 2]))}`;
    }),
  );
}
