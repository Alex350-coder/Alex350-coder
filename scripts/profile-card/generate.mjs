import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fetchProfile } from './fetch-profile.mjs';
import { pixelateAvatar } from './pixel-avatar.mjs';
import { renderCard } from './render-card.mjs';
import { renderCity } from './render-city.mjs';

const login = process.env.USERNAME_GH || process.env.GITHUB_REPOSITORY_OWNER;
const token = process.env.GITHUB_TOKEN;
const output = resolve(process.env.OUTPUT || '../../assets/profile-card.svg');
const cityInput = resolve(process.env.CITY_INPUT || '../../profile-3d-contrib/profile-custom.svg');
const cityOutput = resolve(process.env.CITY_OUTPUT || '../../assets/contrib-city.svg');

if (!login) {
  console.error('Set USERNAME_GH (or GITHUB_REPOSITORY_OWNER) to the GitHub login to render.');
  process.exit(1);
}

async function readCity() {
  try {
    return await readFile(cityInput, 'utf8');
  } catch {
    console.warn(`3D city not found at ${cityInput}; skipping the city panel.`);
    return null;
  }
}

try {
  const profile = await fetchProfile(login, token);
  const pixels = await pixelateAvatar(profile.avatarUrl);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, renderCard(profile, pixels), 'utf8');
  console.log(`Profile card written to ${output}`);

  const citySvg = await readCity();
  if (citySvg) {
    await mkdir(dirname(cityOutput), { recursive: true });
    await writeFile(cityOutput, renderCity(citySvg, profile), 'utf8');
    console.log(`City panel written to ${cityOutput}`);
  }
} catch (err) {
  console.error(`Failed to generate profile assets: ${err.message}`);
  process.exit(1);
}
