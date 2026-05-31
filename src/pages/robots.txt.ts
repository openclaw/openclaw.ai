import { absoluteUrl } from '../lib/seo';

export function GET() {
  return new Response([
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    `Sitemap: ${absoluteUrl('/news-sitemap.xml')}`,
    '',
  ].join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
