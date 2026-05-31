export type AuthorLink = {
  label: string;
  url: string;
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
