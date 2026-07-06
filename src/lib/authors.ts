import { siGithub, siX } from 'simple-icons';

export type AuthorLink = {
  label: string;
  url: string;
};

export type AuthorLinkMeta = AuthorLink & {
  displayLabel: string;
  icon?: string;
  ariaLabel: string;
  order: number;
};

export type BlogAuthor = {
  name: string;
  title?: string;
  org?: string;
  handle?: string;
  url?: string;
  links?: AuthorLink[];
  avatar?: string;
};

const authorProfiles: BlogAuthor[] = [
  {
    name: 'Vincent Koc',
    title: 'Chief Architect',
    org: 'OpenClaw Foundation',
    handle: 'vincent_koc',
    links: [
      { label: '@vincent_koc', url: 'https://x.com/vincent_koc' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/koconder/' },
    ],
    avatar: '/blog/authors/vince-koc.jpg',
  },
  {
    name: 'Jesse Merhi',
    title: 'Core Maintainer',
    org: 'OpenClaw / Atlassian',
    handle: 'jesse_merhi',
    links: [
      { label: '@jesse_merhi', url: 'https://x.com/jesse_merhi' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jesse-merhi/' },
    ],
    avatar: '/blog/authors/jesse-merhi.jpg',
  },
  {
    name: 'Josh Avant',
    title: 'Member of Technical Staff',
    org: 'OpenClaw Foundation',
    handle: 'joshavant',
    links: [
      { label: '@joshavant', url: 'https://x.com/joshavant' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/joshavant/' },
    ],
    avatar: '/avatars/x/joshavant.jpg',
  },
  {
    name: 'Peter Steinberger',
    title: 'Clawfather',
    org: 'OpenClaw Foundation',
    handle: 'steipete',
  },
  {
    name: 'Gideon Adegbesan',
    title: 'Member of Technical Staff',
    org: 'OpenClaw Foundation',
    handle: 'shakker',
    links: [
      { label: '@shakker', url: 'https://x.com/shakker' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/gideonpraise' },
    ],
    avatar: '/blog/authors/gideon-adegbesan.jpg',
  },
  {
    name: 'Nik Pash',
    title: 'Core Maintainer',
    org: 'OpenClaw / OpenAI',
    handle: 'pashmerepat',
  },
  {
    name: "Jamieson O'Reilly",
    handle: 'theonejvo',
  },
  {
    name: 'Bernardo Quintero',
    handle: 'bquintero',
  },
];

/** URL slug for an author page, derived from the display name. */
export function authorSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function authorKey(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized || undefined;
}

const profilesByName = new Map<string, BlogAuthor>();
const profilesByHandle = new Map<string, BlogAuthor>();

for (const profile of authorProfiles) {
  const nameKey = authorKey(profile.name);
  const handleKey = authorKey(profile.handle);
  if (nameKey) profilesByName.set(nameKey, profile);
  if (handleKey) profilesByHandle.set(handleKey, profile);
}

export function resolveAuthorProfile(author: BlogAuthor): BlogAuthor {
  const profile =
    profilesByName.get(authorKey(author.name) ?? '') ??
    profilesByHandle.get(authorKey(author.handle) ?? '');

  if (!profile) return author;

  return {
    name: author.name,
    title: author.title ?? profile.title,
    org: author.org ?? profile.org,
    handle: author.handle ?? profile.handle,
    url: author.url ?? profile.url,
    links: author.links?.length ? author.links : profile.links,
    avatar: author.avatar ?? profile.avatar,
  };
}

const linkedinIcon = 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z';
const websiteIcon = 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.93 9h-3.45a15.7 15.7 0 0 0-1.46-6.15A8.02 8.02 0 0 1 19.93 11zM12 4.04c.83 1.2 1.85 3.63 2.06 6.96H9.94c.21-3.33 1.23-5.76 2.06-6.96zM4.07 13h3.45c.14 2.3.65 4.4 1.46 6.15A8.02 8.02 0 0 1 4.07 13zm3.45-2H4.07a8.02 8.02 0 0 1 4.91-6.15A15.7 15.7 0 0 0 7.52 11zM12 19.96c-.83-1.2-1.85-3.63-2.06-6.96h4.12c-.21 3.33-1.23 5.76-2.06 6.96zm2.98-.81A15.7 15.7 0 0 0 16.44 13h3.49a8.02 8.02 0 0 1-4.95 6.15z';

/** Links to show for an author: explicit links, else url/handle fallback. */
export function getAuthorLinks(author: BlogAuthor): AuthorLink[] {
  if (author.links?.length) return author.links;
  const url = author.url ?? (author.handle ? `https://x.com/${author.handle}` : null);
  if (!url) return [];
  return [{
    label: author.handle ? `@${author.handle}` : new URL(url).hostname.replace(/^www\./, ''),
    url,
  }];
}

function getAuthorLinkMeta(author: BlogAuthor, link: AuthorLink): AuthorLinkMeta {
  const label = link.label.trim();
  const normalizedLabel = label.toLowerCase();
  let hostname = '';

  try {
    hostname = new URL(link.url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    hostname = '';
  }

  if (hostname === 'x.com' || hostname === 'twitter.com' || normalizedLabel === 'x' || normalizedLabel.startsWith('@')) {
    return { ...link, displayLabel: label.startsWith('@') ? label : 'X', icon: siX.path, ariaLabel: `${author.name} on X`, order: 0 };
  }

  if (hostname.endsWith('linkedin.com') || normalizedLabel.includes('linkedin')) {
    return { ...link, displayLabel: 'LinkedIn', icon: linkedinIcon, ariaLabel: `${author.name} on LinkedIn`, order: 1 };
  }

  if (hostname === 'github.com' || normalizedLabel.includes('github')) {
    return { ...link, displayLabel: 'GitHub', icon: siGithub.path, ariaLabel: `${author.name} on GitHub`, order: 2 };
  }

  return { ...link, displayLabel: label, icon: websiteIcon, ariaLabel: `${author.name}: ${label}`, order: 3 };
}

export function getSortedAuthorLinkMeta(author: BlogAuthor): AuthorLinkMeta[] {
  return getAuthorLinks(author)
    .map((link, index) => ({ ...getAuthorLinkMeta(author, link), index }))
    .sort((a, b) => a.order - b.order || a.index - b.index);
}
