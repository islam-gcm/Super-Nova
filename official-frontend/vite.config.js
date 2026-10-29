import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (process.env.VERCEL) {
    const required = ['VITE_API_BASE_URL', 'VITE_VIRTUAL_CLUB_URL']
    const invalid = required.filter((name) => {
      try {
        const url = new URL(env[name]?.trim())
        return url.protocol !== 'https:'
          || /^(localhost|127\.0\.0\.1)$|\.example$|^backend-domain\.com$/i.test(url.hostname)
          || (name === 'VITE_API_BASE_URL' && url.pathname.replace(/\/$/, '') !== '/api/v1')
      } catch {
        return true
      }
    })
    if (invalid.length) {
      throw new Error(`Set deployed HTTPS URLs for ${invalid.join(', ')}`)
    }
  }
  return {
    plugins: [react()],
    server: { host: 'localhost', port: 5500, strictPort: true },
  }
})
