import { defineConfig } from 'vite'

// We set base to the repository path so built assets use /impostor/ on GitHub Pages
export default defineConfig({
  base: '/impostor/'
})
