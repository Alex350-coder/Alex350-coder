// Fetches the profile data the card needs. Uses GraphQL when a token is
// available (needed for the contribution count) and falls back to REST.

const API = 'https://api.github.com';

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      login
      name
      bio
      avatarUrl(size: 96)
      followers { totalCount }
      contributionsCollection { contributionCalendar { totalContributions } }
      repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100) {
        totalCount
        nodes { stargazerCount primaryLanguage { name color } }
      }
    }
  }
`;

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} on ${url}: ${await res.text()}`);
  }
  return res.json();
}

function topLanguages(repos, limit = 4) {
  const counts = new Map();
  for (const { name, color } of repos.map((r) => r.language).filter(Boolean)) {
    const prev = counts.get(name) ?? { name, color, count: 0 };
    counts.set(name, { ...prev, count: prev.count + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

async function fetchWithGraphQL(login, token) {
  const body = await request(`${API}/graphql`, {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (body.errors) throw new Error(`GraphQL error: ${JSON.stringify(body.errors)}`);

  const u = body.data.user;
  const repos = u.repositories.nodes.map((r) => ({
    stars: r.stargazerCount,
    language: r.primaryLanguage,
  }));
  return {
    login: u.login,
    name: u.name || u.login,
    bio: u.bio || '',
    avatarUrl: u.avatarUrl,
    followers: u.followers.totalCount,
    repoCount: u.repositories.totalCount,
    stars: repos.reduce((sum, r) => sum + r.stars, 0),
    contributions: u.contributionsCollection.contributionCalendar.totalContributions,
    languages: topLanguages(repos),
  };
}

async function fetchWithRest(login) {
  const user = await request(`${API}/users/${login}`);
  const list = await request(`${API}/users/${login}/repos?per_page=100&type=owner`);
  const repos = list
    .filter((r) => !r.fork)
    .map((r) => ({
      stars: r.stargazers_count,
      language: r.language ? { name: r.language, color: null } : null,
    }));
  return {
    login: user.login,
    name: user.name || user.login,
    bio: user.bio || '',
    avatarUrl: `${user.avatar_url}&s=96`,
    followers: user.followers,
    repoCount: user.public_repos,
    stars: repos.reduce((sum, r) => sum + r.stars, 0),
    contributions: null,
    languages: topLanguages(repos),
  };
}

export function fetchProfile(login, token) {
  return token ? fetchWithGraphQL(login, token) : fetchWithRest(login);
}
