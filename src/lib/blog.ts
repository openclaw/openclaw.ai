import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const includeDrafts = import.meta.env.OPENCLAW_BLOG_PREVIEW_DRAFTS === '1';
  const posts = await getCollection('blog', ({ data }) => includeDrafts || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
