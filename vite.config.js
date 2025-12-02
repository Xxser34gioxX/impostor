// Use CommonJS so Vite can load this config in the Actions runner (Node expects CJS)
const { defineConfig } = require('vite')

// We set base to the repository path so built assets use /impostor/ on GitHub Pages
module.exports = defineConfig({
  base: '/impostor/'
})
