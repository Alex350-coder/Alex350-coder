import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fetchProfile } from './fetch-profile.mjs';
import { pixelateAvatar } from './pixel-avatar.mjs';
import { renderCard } from './render-card.mjs';

const login = process.env.USERNAME_GH || process.env.GITHUB_REPOSITORY_OWNER;
const token = process.env.GITHUB_TOKEN;
const output = resolve(process.env.OUTPUT || '../../assets/profile-card.svg');

if (!login) {
  console.error('Set USERNAME_GH (or GITHUB_REPOSITORY_OWNER) to the GitHub login to render.');
  process.exit(1);
}

try {
  const profile = await fetchProfile(login, token);
  const pixels = await pixelateAvatar(profile.avatarUrl);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, renderCard(profile, pixels), 'utf8');
  console.log(`Profile card written to ${output}`);
} catch (err) {
  console.error(`Failed to generate profile card: ${err.message}`);
  process.exit(1);
}
