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
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'theme-color', content: '#0a1020' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      // Baked at build time. Server render and first client render agree on it,
      // so the countdown has no hydration mismatch. Corrected on mount.
      buildTime: new Date().toISOString(),

      // Live event data. Empty means the site simply renders the JSON baked
      // in at build time, which is exactly how it behaves today.
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    }
  },

  css: ['~/assets/css/main.css'],

  ssr: true,
  nitro: {
    prerender: {
      // Routes are enumerated from content/events, so no crawling is needed.
      // Crawling also chases hashed asset URLs through app.baseURL and 404s.
      crawlLinks: false,
      routes: ['/', '/admin', ...slugs.map(s => `/${s}`)]
    }
  }
})
