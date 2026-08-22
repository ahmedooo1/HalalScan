export default defineNuxtConfig({
  compatibilityDate: '2024-08-01',
  devtools: { enabled: false },
  ssr: false,
  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'HalalScan - Vérifie un produit en un scan',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            "Scanne le code-barres d'un produit pour repérer les ingrédients douteux ou non-halal, à partir des données publiques Open Food Facts.",
        },
        { name: 'theme-color', content: '#0B1310' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/icon-192.png' },
      ],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'HalalScan',
      short_name: 'HalalScan',
      description:
        "Scanne le code-barres d'un produit pour repérer les ingrédients douteux ou non-halal.",
      theme_color: '#0B1310',
      background_color: '#0B1310',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,png,svg,ico}', 'offline.html'],
      navigateFallback: '/offline.html',
      navigateFallbackDenylist: [/^\/offline\.html$/],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 3,
          },
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
  },
})
