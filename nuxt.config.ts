import { readdirSync } from 'node:fs'

// Every party in content/events/ gets its own prerendered page.
// Drop a new JSON file in there and it is picked up automatically.
const slugs = readdirSync('./content/events')
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace(/\.json$/, ''))

export default defineNuxtConfig({
  compatibilityDate: '2026-09-07',
  devtools: { enabled: true },

  // GitHub Pages serves a project repo under /<repo>/.
  // Set NUXT_APP_BASE_URL=/ if a custom domain is ever added back.
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/solfest/',
    head: {
      htmlAttrs: { lang: 'no' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      // Baked at build time. Server render and first client render agree on it,
      // so the countdown has no hydration mismatch. Corrected on mount.
      buildTime: new Date().toISOString()
    }
  },

  css: ['~/assets/css/main.css'],

  ssr: true,
  nitro: {
    prerender: {
      // Routes are enumerated from content/events, so crawling is unnecessary.
      // It also chases hashed asset URLs through app.baseURL and 404s the build.
      crawlLinks: false,
      routes: ['/', ...slugs.map(s => `/${s}`)]
    }
  }
})
