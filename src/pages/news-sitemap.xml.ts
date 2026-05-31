import { getPublishedBlogPosts } from '../lib/blog';
import {
  PUBLICATION_LANGUAGE,
  PUBLICATION_NAME,
  absoluteUrl,
  blogPostPath,
  xmlEscape,
} from '../lib/seo';

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

function newsUrl(post: Awaited<ReturnType<typeof getPublishedBlogPosts>>[number]): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(absoluteUrl(blogPostPath(post)))}</loc>`,
    '    <news:news>',
    '      <news:publication>',
    `        <news:name>${xmlEscape(PUBLICATION_NAME)}</news:name>`,
    `        <news:language>${PUBLICATION_LANGUAGE}</news:language>`,
    '      </news:publication>',
    `      <news:publication_date>${post.data.date.toISOString()}</news:publication_date>`,
    `      <news:title>${xmlEscape(post.data.title)}</news:title>`,
    '    </news:news>',
    '  </url>',
  ].join('\n');
}

export async function GET() {
  const now = Date.now();
  const posts = await getPublishedBlogPosts();
  const recentPosts = posts.filter((post) => {
    const publishedAt = post.data.date.valueOf();
    return publishedAt <= now && now - publishedAt <= TWO_DAYS_MS;
  });

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentPosts.map(newsUrl).join('\n')}
</urlset>
`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
