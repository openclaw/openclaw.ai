import { getPublishedBlogPosts } from '../lib/blog';
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
  const urls = [
    ...staticPaths.map((pathname) => sitemapUrl(pathname)),
    ...posts.map((post) => sitemapUrl(blogPostPath(post), post.data.date)),
  ];

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
