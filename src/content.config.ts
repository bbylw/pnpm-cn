import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    desc: z.string().default(""),
    headingIds: z.array(z.string()).default([]),
  }),
});

export const collections = { docs };
