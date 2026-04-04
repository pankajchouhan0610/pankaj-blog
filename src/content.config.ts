import { defineCollection, z } from 'astro:content';

// Slug is read from frontmatter for URLs but stripped before this schema runs on legacy markdown collections
// (see Astro autogenerateCollections + getEntryDataAndImages). Do not require slug here.
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  blogs: blogCollection,
};
