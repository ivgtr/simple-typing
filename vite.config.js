import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isGitHubPages = mode === 'github'

  return {
    plugins: [svelte()],
    base: isGitHubPages ? '/simple-typing/' : '/',
    build: {
      outDir: isGitHubPages ? 'out' : 'dist'
    }
  }
})
