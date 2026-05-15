import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const authorSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  url: z.string().optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).optional(),
  avatar: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    // Single author (legacy)
    author: z.string().optional(),
    authorHandle: z.string().optional(),
    authorUrl: z.string().optional(),
    authorAvatar: z.string().optional(),
    // Multiple authors
    authors: z.array(authorSchema).optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
