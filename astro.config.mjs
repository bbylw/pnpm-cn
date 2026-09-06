// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import remarkDirective from "remark-directive";
import { unified } from "@astrojs/markdown-remark";
import { headingIds } from "./src/plugins/heading-ids.js";
import { admonitions } from "./src/plugins/admonitions.js";

export default defineConfig({
  site: "https://pnpm.ndjp.net",
  trailingSlash: "never",
  output: "static",
  prefetch: false,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      wrap: false,
    },
    processor: unified({
      remarkPlugins: [headingIds, remarkDirective, admonitions],
      smartypants: false,
    }),
  },
  vite: {
    plugins: [tailwind()],
  },
});
