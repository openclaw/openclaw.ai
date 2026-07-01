import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://openclaw.ai',
  output: 'static',
  // Preserve Astro 6 whitespace semantics while upgrading to Astro 7.
  compressHTML: true,
  build: {
    assets: 'assets'
  },
});
