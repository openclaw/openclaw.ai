import { getPublishedBlogPosts } from '../lib/blog';
import { authorSlug, resolveAuthorProfile, type BlogAuthor } from '../lib/authors';
import { blogPostPath, sitemapUrl } from '../lib/seo';

const staticPaths = [
  '/',
  '/blog',
  '/ecosystem',
  '/integrations',
  '/press',
  '/publications/clawhub-security-signals.pdf',
  '/privacy',
  '/showcase',
  '/shoutouts',
  '/cat',
  '/cats',
];

export async function GET() {
  const posts = await getPublishedBlogPosts();

  // Author pages, with lastmod set to each author's most recent post
  const authorLastPost = new Map<string, Date>();
  for (const post of posts) {
    const rawAuthors: BlogAuthor[] = post.data.authors?.length
      ? post.data.authors
      : [{
          name: post.data.author ?? 'OpenClaw Team',
          handle: post.data.authorHandle,
          url: post.data.authorUrl,
          avatar: post.data.authorAvatar,
        }];
    for (const raw of rawAuthors) {
      const slug = authorSlug(resolveAuthorProfile(raw).name);
      if (!slug) continue;
      const current = authorLastPost.get(slug);
      if (!current || post.data.date > current) {
        authorLastPost.set(slug, post.data.date);
      }
    }
  }

  const urls = [
    ...staticPaths.map((pathname) => sitemapUrl(pathname)),
    ...posts.map((post) => sitemapUrl(blogPostPath(post), post.data.date)),
    ...[...authorLastPost.entries()].map(([slug, lastmod]) =>
      sitemapUrl(`/blog/authors/${slug}`, lastmod)
    ),
  ];

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
